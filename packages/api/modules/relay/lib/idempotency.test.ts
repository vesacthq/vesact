import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface Row {
	requestHash: string;
	state: "in_flight" | "completed";
	responseStatus: number | null;
	responseBody: string | null;
	expiresAt: Date;
}

const rows = new Map<string, Row>();
const scopeKey = (scope: { apiKeyId: string; routeKey: string; key: string }) =>
	`${scope.apiKeyId}|${scope.routeKey}|${scope.key}`;

vi.mock("@repo/database", () => ({
	claimIdempotencyKey: vi.fn(async (scope, requestHash: string, lockUntil: Date) => {
		const existing = rows.get(scopeKey(scope));
		if (existing && existing.expiresAt > new Date()) {
			return false;
		}
		rows.set(scopeKey(scope), {
			requestHash,
			state: "in_flight",
			responseStatus: null,
			responseBody: null,
			expiresAt: lockUntil,
		});
		return true;
	}),
	findIdempotencyKey: vi.fn(async (scope) => {
		const row = rows.get(scopeKey(scope));
		if (!row) {
			return null;
		}
		return row.state === "completed" && row.responseStatus !== null && row.responseBody !== null
			? {
					state: "completed",
					requestHash: row.requestHash,
					responseStatus: row.responseStatus,
					responseBody: row.responseBody,
				}
			: { state: "in_flight", requestHash: row.requestHash };
	}),
	completeIdempotencyKey: vi.fn(async (scope, response) => {
		const row = rows.get(scopeKey(scope));
		if (row) {
			Object.assign(row, { state: "completed", ...response });
		}
	}),
}));

import { completeIdempotencyKey } from "@repo/database";

import type { RelayContext } from "../context";
import { idempotent } from "./idempotency";

type Env = { Variables: { requestId: string; relay?: RelayContext } };

const handled: string[] = [];

function relay(apiKeyId: string): RelayContext {
	return {
		requestId: "req_test",
		auth: { organizationId: "org_1", apiKeyId, permissions: {}, key: {} as never },
		trace: {},
	};
}

function build(apiKeyId = "key_1") {
	return new Hono<Env>()
		.use(async (c, next) => {
			c.set("requestId", "req_test");
			c.set("relay", relay(apiKeyId));
			await next();
		})
		.use("/v1/things", idempotent)
		.post("/v1/things", async (c) => {
			const { name } = await c.req.json<{ name: string }>();
			handled.push(name);
			return c.json({ id: handled.length, name }, 201);
		})
		.get("/v1/things", (c) => c.json([]))
		.post("/v1/failing", idempotent, (c) => {
			handled.push("failing");
			return c.json({ code: "BAD_GATEWAY", status: 502 }, 502);
		});
}

function post(app: Hono<Env>, path: string, body: unknown, key?: string) {
	return app.request(path, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json", ...(key ? { "Idempotency-Key": key } : {}) },
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers({ now: new Date("2026-09-12T10:00:00.000Z") });
	rows.clear();
	handled.length = 0;
});

afterEach(() => {
	vi.useRealTimers();
});

describe("idempotent", () => {
	it("ignores requests without a key and non-POST requests", async () => {
		const app = build();
		expect((await post(app, "/v1/things", { name: "a" })).status).toBe(201);
		expect((await app.request("/v1/things", { headers: { "Idempotency-Key": "k" } })).status).toBe(
			200,
		);
		expect(rows.size).toBe(0);
	});

	it("rejects a key longer than 255 characters", async () => {
		const response = await post(build(), "/v1/things", { name: "a" }, "k".repeat(256));
		expect(response.status).toBe(400);
		expect(await response.json()).toMatchObject({ code: "BAD_REQUEST", status: 400 });
		expect(handled).toEqual([]);
	});

	it("runs the handler once and replays its response for the same body", async () => {
		const app = build();
		const first = await post(app, "/v1/things", { name: "a" }, "k1");
		expect(first.status).toBe(201);
		expect(first.headers.get("Idempotent-Replayed")).toBeNull();
		expect(completeIdempotencyKey).toHaveBeenCalledWith(
			{ apiKeyId: "key_1", routeKey: "/v1/things", key: "k1" },
			{
				responseStatus: 201,
				responseBody: JSON.stringify({ id: 1, name: "a" }),
				expiresAt: new Date("2026-09-13T10:00:00.000Z"),
			},
		);

		const replay = await post(app, "/v1/things", { name: "a" }, "k1");
		expect(replay.status).toBe(201);
		expect(replay.headers.get("Idempotent-Replayed")).toBe("true");
		expect(replay.headers.get("Content-Type")).toBe("application/json");
		expect(await replay.json()).toEqual({ id: 1, name: "a" });
		expect(handled).toEqual(["a"]);
	});

	it("answers 422 IDEMPOTENCY_CONFLICT for the same key with another body", async () => {
		const app = build();
		await post(app, "/v1/things", { name: "a" }, "k1");
		const response = await post(app, "/v1/things", { name: "b" }, "k1");
		expect(response.status).toBe(422);
		expect(await response.json()).toMatchObject({ code: "IDEMPOTENCY_CONFLICT", status: 422 });
		expect(handled).toEqual(["a"]);
	});

	it("answers 409 IDEMPOTENCY_IN_FLIGHT while the first request is running", async () => {
		const app = build();
		rows.set("key_1|/v1/things|k1", {
			requestHash: "irrelevant",
			state: "in_flight",
			responseStatus: null,
			responseBody: null,
			expiresAt: new Date(Date.now() + 30_000),
		});
		const response = await post(app, "/v1/things", { name: "a" }, "k1");
		expect(response.status).toBe(409);
		expect(await response.json()).toMatchObject({ code: "IDEMPOTENCY_IN_FLIGHT", status: 409 });
		expect(handled).toEqual([]);
		expect(completeIdempotencyKey).not.toHaveBeenCalled();
	});

	it("treats an expired response as a new request", async () => {
		const app = build();
		await post(app, "/v1/things", { name: "a" }, "k1");
		vi.setSystemTime(new Date("2026-09-13T10:00:01.000Z"));
		const response = await post(app, "/v1/things", { name: "b" }, "k1");
		expect(response.status).toBe(201);
		expect(response.headers.get("Idempotent-Replayed")).toBeNull();
		expect(await response.json()).toEqual({ id: 2, name: "b" });
		expect(handled).toEqual(["a", "b"]);
	});

	it("takes over a claim whose 60 second lock ran out", async () => {
		const app = build();
		rows.set("key_1|/v1/things|k1", {
			requestHash: "irrelevant",
			state: "in_flight",
			responseStatus: null,
			responseBody: null,
			expiresAt: new Date(Date.now() - 1),
		});
		const response = await post(app, "/v1/things", { name: "a" }, "k1");
		expect(response.status).toBe(201);
		expect(handled).toEqual(["a"]);
	});

	it("scopes keys by API key and route", async () => {
		const app = build();
		await post(app, "/v1/things", { name: "a" }, "k1");
		expect((await post(build("key_2"), "/v1/things", { name: "a" }, "k1")).status).toBe(201);
		expect((await post(app, "/v1/failing", { name: "a" }, "k1")).status).toBe(502);
		expect(handled).toEqual(["a", "a", "failing"]);
	});

	it("stores and replays a 5xx response too", async () => {
		const app = build();
		await post(app, "/v1/failing", { name: "a" }, "k1");
		const replay = await post(app, "/v1/failing", { name: "a" }, "k1");
		expect(replay.status).toBe(502);
		expect(replay.headers.get("Idempotent-Replayed")).toBe("true");
		expect(await replay.json()).toEqual({ code: "BAD_GATEWAY", status: 502 });
		expect(handled).toEqual(["failing"]);
	});
});
