import { parseArgs } from "node:util";

import { logger } from "@repo/logs";
import { auth } from "@repo/relay/auth";
import { db, deleteApiKeysByIds, listRelayApiUsageByKey } from "@repo/relay/db";

import { accessHeaders, createChecks } from "./lib/acceptance";

/**
 * Runs the acceptance list of issue #35 against a deployed Relay API. Needs
 * RELAY_DATABASE_URL for the same environment (keys are created server-side
 * through Relay's own auth) and, on preview, CF_ACCESS_CLIENT_ID /
 * CF_ACCESS_CLIENT_SECRET. The user and organization must exist in Relay's
 * database (`relay:session` creates a user; the console creates organizations).
 *
 *   sops exec-env secrets/relay-database.preview.env \
 *     'pnpm --filter @repo/scripts relay:acceptance --url https://api.preview.vesact.com --org <slug> --user <email>'
 */
const { values } = parseArgs({
	options: {
		url: { type: "string" },
		org: { type: "string" },
		user: { type: "string" },
		fast: { type: "boolean", default: false },
	},
});

if (!values.url || !values.org || !values.user) {
	logger.error("Usage: relay:acceptance --url <api url> --org <slug> --user <email> [--fast]");
	process.exit(2);
}

const baseUrl = values.url.replace(/\/$/, "");
const { check, report } = createChecks();

interface ErrorBody {
	code?: string;
	status?: number;
	data?: { reason?: string };
}

async function me(key?: string) {
	const response = await fetch(`${baseUrl}/v1/me`, {
		headers: { ...accessHeaders(), ...(key ? { Authorization: `Bearer ${key}` } : {}) },
	});
	const body = (await response.json()) as ErrorBody & Record<string, unknown>;
	return { response, body };
}

function expectStatus(
	response: Response,
	body: ErrorBody,
	status: number,
	code: string,
	reason?: string,
): true | string {
	if (response.status !== status) {
		return `expected ${status}, got ${response.status} ${JSON.stringify(body)}`;
	}
	if (body.code !== code) {
		return `expected code ${code}, got ${JSON.stringify(body)}`;
	}
	if (reason && body.data?.reason !== reason) {
		return `expected reason ${reason}, got ${JSON.stringify(body.data)}`;
	}
	return true;
}

async function main() {
	const organization = await db.query.organization.findFirst({
		where: (table, { eq }) => eq(table.slug, values.org as string),
	});
	const user = await db.query.user.findFirst({
		where: (table, { eq }) => eq(table.email, values.user as string),
	});

	if (!organization || !user) {
		logger.error("Organization or user not found");
		process.exit(2);
	}

	const owner = { organizationId: organization.id, userId: user.id };
	const created: string[] = [];

	async function createKey(body: Record<string, unknown>) {
		const key = await auth.api.createApiKey({
			body: { ...owner, name: "acceptance", ...body },
		});
		created.push(key.id);
		return key;
	}

	try {
		const normal = await createKey({});
		const limited = await createKey({ rateLimitMax: 3, rateLimitTimeWindow: 60_000 });
		const quota = await createKey({ remaining: 1 });
		const disabled = await createKey({});
		await auth.api.updateApiKey({ body: { keyId: disabled.id, enabled: false, userId: user.id } });
		const deleted = await createKey({});
		await deleteApiKeysByIds([deleted.id]);

		await check(
			"GET /v1/openapi.json → 3.1 with /health and /me; /me answers 401 and 429",
			async () => {
				const response = await fetch(`${baseUrl}/v1/openapi.json`, { headers: accessHeaders() });
				if (response.status !== 200) {
					return `got ${response.status}`;
				}
				const spec = (await response.json()) as {
					openapi?: string;
					security?: unknown[];
					paths?: Record<string, { get?: { responses?: Record<string, unknown> } }>;
				};
				if (!spec.openapi?.startsWith("3.1.")) {
					return `openapi was ${spec.openapi}`;
				}
				if (!spec.paths?.["/health"] || !spec.paths["/me"]) {
					return `paths were ${Object.keys(spec.paths ?? {}).join(", ")}`;
				}
				if (!spec.security?.length) {
					return "no document-level security";
				}
				const responses = Object.keys(spec.paths["/me"].get?.responses ?? {});
				return (
					(responses.includes("401") && responses.includes("429")) ||
					`/me responses were ${responses.join(", ")}`
				);
			},
		);

		await check("GET /v1/docs → HTML reference page", async () => {
			const response = await fetch(`${baseUrl}/v1/docs`, { headers: accessHeaders() });
			if (response.status !== 200) {
				return `got ${response.status}`;
			}
			const type = response.headers.get("content-type") ?? "";
			return type.includes("text/html") || `content-type was ${type}`;
		});

		await check("no Authorization → 401 UNAUTHORIZED with X-Request-Id", async () => {
			const { response, body } = await me();
			const status = expectStatus(response, body, 401, "UNAUTHORIZED", "MISSING_KEY");
			if (status !== true) {
				return status;
			}
			const requestId = response.headers.get("X-Request-Id") ?? "";
			return /^req_[0-9A-HJKMNP-TV-Z]{26}$/.test(requestId) || `X-Request-Id was ${requestId}`;
		});

		await check("wrong key → 401", async () => {
			const { response, body } = await me("relay_definitely_not_a_key");
			return expectStatus(response, body, 401, "UNAUTHORIZED", "INVALID_API_KEY");
		});

		await check("disabled key → 401 with reason KEY_DISABLED", async () => {
			const { response, body } = await me(disabled.key);
			return expectStatus(response, body, 401, "UNAUTHORIZED", "KEY_DISABLED");
		});

		await check("deleted key → 401 with reason INVALID_API_KEY", async () => {
			const { response, body } = await me(deleted.key);
			return expectStatus(response, body, 401, "UNAUTHORIZED", "INVALID_API_KEY");
		});

		let lastRequestId = "";
		await check("correct key → 200, X-RateLimit-Limit 300, Remaining drops by one", async () => {
			const first = await me(normal.key);
			if (first.response.status !== 200) {
				return `first call ${first.response.status} ${JSON.stringify(first.body)}`;
			}
			if (first.body.id !== normal.id || first.body.organizationId !== organization.id) {
				return `body was ${JSON.stringify(first.body)}`;
			}
			if (first.response.headers.get("X-RateLimit-Limit") !== "300") {
				return `X-RateLimit-Limit was ${first.response.headers.get("X-RateLimit-Limit")}`;
			}
			const second = await me(normal.key);
			lastRequestId = second.response.headers.get("X-Request-Id") ?? "";
			const remaining = [first, second].map((call) =>
				Number(call.response.headers.get("X-RateLimit-Remaining")),
			);
			return (
				remaining[0] - remaining[1] === 1 || `remaining went ${remaining[0]} → ${remaining[1]}`
			);
		});

		await check("rateLimitMax 3 → 4th call 429 TOO_MANY_REQUESTS with Retry-After", async () => {
			for (let call = 1; call <= 3; call++) {
				const { response, body } = await me(limited.key);
				if (response.status !== 200) {
					return `call ${call} was ${response.status} ${JSON.stringify(body)}`;
				}
			}
			const { response, body } = await me(limited.key);
			const status = expectStatus(response, body, 429, "TOO_MANY_REQUESTS");
			if (status !== true) {
				return status;
			}
			const retryAfter = Number(response.headers.get("Retry-After"));
			return (retryAfter >= 1 && retryAfter <= 60) || `Retry-After was ${retryAfter}`;
		});

		if (!values.fast) {
			await check("rate limit recovers after the window (61s wait)", async () => {
				await new Promise((resolve) => setTimeout(resolve, 61_000));
				const { response, body } = await me(limited.key);
				return response.status === 200 || `got ${response.status} ${JSON.stringify(body)}`;
			});
		}

		await check("remaining 1 → 2nd call 429 QUOTA_EXCEEDED", async () => {
			const first = await me(quota.key);
			if (first.response.status !== 200) {
				return `first call ${first.response.status} ${JSON.stringify(first.body)}`;
			}
			const { response, body } = await me(quota.key);
			return expectStatus(response, body, 429, "QUOTA_EXCEEDED");
		});

		await check(
			"each call wrote a relay_api_usage row with the response's request id",
			async () => {
				await new Promise((resolve) => setTimeout(resolve, 2_000));
				const rows = await listRelayApiUsageByKey(normal.id);
				if (rows.length < 2) {
					return `found ${rows.length} rows`;
				}
				const latest = rows[0];
				if (latest.requestId !== lastRequestId) {
					return `latest row has ${latest.requestId}, response had ${lastRequestId}`;
				}
				return latest.path === "/v1/me" || `path was ${latest.path}`;
			},
		);
	} finally {
		await deleteApiKeysByIds(created);
	}

	report();
}

main().catch((error) => {
	logger.error(error);
	process.exit(1);
});
