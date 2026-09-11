import { claimIdempotencyKey, completeIdempotencyKey, findIdempotencyKey } from "@repo/database";
import { createMiddleware } from "hono/factory";
import { routePath } from "hono/route";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { RelayContext } from "../context";
import { sha256Hex } from "./digest";
import { type RelayHttpError, reply } from "./errors";

type Env = { Variables: { requestId: string; relay?: RelayContext } };

const maxKeyLength = 255;
const responseTtlMs = 24 * 60 * 60 * 1000;
/** A request that has not completed by then lost its claim; a retry takes over. */
const lockMs = 60 * 1000;

export function keyTooLong(): RelayHttpError {
	return {
		status: 400,
		code: "BAD_REQUEST",
		message: `Idempotency-Key must be at most ${maxKeyLength} characters`,
	};
}

export function inFlight(): RelayHttpError {
	return {
		status: 409,
		code: "IDEMPOTENCY_IN_FLIGHT",
		message: "A request with this Idempotency-Key is still being processed",
	};
}

export function conflict(): RelayHttpError {
	return {
		status: 422,
		code: "IDEMPOTENCY_CONFLICT",
		message: "This Idempotency-Key was already used with a different request body",
	};
}

/**
 * Mount on one POST route, after `relayKey`. The first response is kept for
 * 24 hours under (key id, route, Idempotency-Key) and replayed for the same
 * body; a different body is a conflict, a request still running a 409.
 */
export const idempotent = createMiddleware<Env>(async (c, next) => {
	const key = c.req.header("Idempotency-Key");

	if (c.req.method !== "POST" || !key) {
		return next();
	}

	if (key.length > maxKeyLength) {
		return reply(c, keyTooLong());
	}

	const apiKeyId = c.get("relay")?.auth?.apiKeyId;

	if (!apiKeyId) {
		throw new Error("idempotent must run after relayKey");
	}

	const scope = { apiKeyId, routeKey: routePath(c), key };
	const requestHash = await sha256Hex(await c.req.raw.clone().arrayBuffer());
	const claimed = await claimIdempotencyKey(scope, requestHash, new Date(Date.now() + lockMs));

	if (!claimed) {
		const stored = await findIdempotencyKey(scope);

		if (!stored || stored.state === "in_flight") {
			return reply(c, inFlight());
		}

		if (stored.requestHash !== requestHash) {
			return reply(c, conflict());
		}

		return c.newResponse(stored.responseBody, stored.responseStatus as ContentfulStatusCode, {
			"Content-Type": "application/json",
			"Idempotent-Replayed": "true",
		});
	}

	await next();

	await completeIdempotencyKey(scope, {
		responseStatus: c.res.status,
		responseBody: await c.res.clone().text(),
		expiresAt: new Date(Date.now() + responseTtlMs),
	});
});
