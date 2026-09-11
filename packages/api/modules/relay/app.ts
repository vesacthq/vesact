import { auth } from "@repo/auth";
import { recordRelayApiUsage } from "@repo/database";
import { logger } from "@repo/logs";
import { type Context, Hono } from "hono";
import { except } from "hono/combine";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import type { RelayContext } from "./context";
import { relayHandler } from "./handler";
import { metaWebhook } from "./integrations/meta/webhook";
import { errorPayload, internalError, notFoundError, type RelayHttpError } from "./lib/errors";
import { newId } from "./lib/ids";
import { mapVerifyError, missingKey, rateLimitHeaders } from "./lib/verify";

type Env = { Variables: { requestId: string; relay?: RelayContext } };

const requestId = createMiddleware<Env>(async (c, next) => {
	const id = newId("req");
	c.set("requestId", id);
	c.header("X-Request-Id", id);
	await next();
});

function bearerToken(header: string | undefined): string | undefined {
	return /^Bearer\s+(\S+)$/i.exec(header ?? "")?.[1];
}

function reply(c: Context<Env>, error: RelayHttpError) {
	const { status, headers, body } = errorPayload(error);
	return c.newResponse(body, status, headers);
}

function background(c: Context<Env>, task: Promise<unknown>) {
	try {
		c.executionCtx.waitUntil(task);
	} catch {
		// Outside Workers (tests, scripts) the promise runs on its own.
	}
}

const relayKey = createMiddleware<Env>(async (c, next) => {
	const startedAt = Date.now();
	const token = bearerToken(c.req.header("Authorization"));

	if (!token) {
		return reply(c, missingKey());
	}

	const result = await auth.api.verifyApiKey({ body: { key: token } });

	if (!result.valid || !result.key) {
		return reply(c, mapVerifyError(result.error));
	}

	const key = result.key;
	const relay: RelayContext = {
		requestId: c.get("requestId"),
		auth: {
			organizationId: key.referenceId,
			apiKeyId: key.id,
			permissions: key.permissions ?? {},
			key,
		},
		trace: {},
	};
	c.set("relay", relay);

	await next();

	for (const [name, value] of Object.entries(rateLimitHeaders(key))) {
		c.res.headers.set(name, value);
	}

	background(
		c,
		recordRelayApiUsage({
			apiKeyId: key.id,
			organizationId: key.referenceId,
			method: c.req.method,
			path: relay.trace.path ? `/v1${relay.trace.path}` : c.req.path,
			status: c.res.status,
			durationMs: Date.now() - startedAt,
			requestId: relay.requestId,
		}).catch((error: unknown) => {
			logger.error(error, { ctx: "recordRelayApiUsage", requestId: relay.requestId });
		}),
	);
});

const publicPaths = ["/v1/health", "/v1/openapi.json", "/v1/docs"];

export const relayApp = new Hono<Env>()
	.use(requestId)
	.route("/webhooks/meta", metaWebhook)
	.use("/v1/*", except(publicPaths, relayKey))
	.all("/v1/*", async (c) => {
		const { matched, response } = await relayHandler.handle(c.req.raw, {
			prefix: "/v1",
			context: c.get("relay") ?? { requestId: c.get("requestId"), trace: {} },
		});

		return matched
			? c.newResponse(response.body, response)
			: reply(c, notFoundError(c.req.method, c.req.path));
	})
	.notFound((c) => reply(c, notFoundError(c.req.method, c.req.path)))
	.onError((error, c) => {
		if (error instanceof HTTPException) {
			return error.getResponse();
		}

		logger.error(error, { requestId: c.get("requestId") });
		return reply(c, internalError());
	});
