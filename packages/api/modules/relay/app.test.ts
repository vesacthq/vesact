import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: { api: { verifyApiKey: vi.fn() } },
}));

vi.mock("@repo/database", () => ({
	recordRelayApiUsage: vi.fn(async () => {}),
}));

vi.mock("@repo/logs", () => ({
	logger: { error: vi.fn(), log: vi.fn() },
}));

import { auth } from "@repo/auth";
import { recordRelayApiUsage } from "@repo/database";

import { relayApp } from "./app";

const verifyApiKey = vi.mocked(auth.api.verifyApiKey);

const key = {
	id: "key_1",
	configId: "default",
	name: "acceptance",
	start: "relay_ab",
	prefix: "relay_",
	referenceId: "org_1",
	refillInterval: null,
	refillAmount: null,
	lastRefillAt: null,
	enabled: true,
	rateLimitEnabled: true,
	rateLimitTimeWindow: 60_000,
	rateLimitMax: 300,
	requestCount: 5,
	remaining: null,
	lastRequest: new Date("2026-09-11T10:00:00.000Z"),
	expiresAt: null,
	createdAt: new Date("2026-09-01T00:00:00.000Z"),
	updatedAt: new Date("2026-09-11T10:00:00.000Z"),
	metadata: null,
	permissions: null,
};

function failure(code: string, details?: { tryAgainIn: number }) {
	return { valid: false, error: { code, message: code, details }, key: null };
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("GET /v1/health", () => {
	it("answers without a key", async () => {
		const response = await relayApp.request("/v1/health");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: "ok" });
		expect(verifyApiKey).not.toHaveBeenCalled();
	});
});

describe("the public routes", () => {
	it("serves the OpenAPI document without a key", async () => {
		vi.stubEnv("VITE_RELAY_API_URL", "https://api.example.com");
		const response = await relayApp.request("/v1/openapi.json");
		expect(response.status).toBe(200);
		expect(response.headers.get("X-Request-Id")).toMatch(/^req_/);

		const spec = await response.json();
		expect(spec.openapi).toMatch(/^3\.1\./);
		expect(spec.info.title).toBe("Relay API");
		expect(spec.servers).toEqual([{ url: "https://api.example.com/v1" }]);
		expect(spec.security).toEqual([{ bearerAuth: [] }]);
		expect(spec.components.securitySchemes.bearerAuth).toEqual({ type: "http", scheme: "bearer" });
		expect(spec.paths["/health"].get.security).toEqual([]);
		expect(Object.keys(spec.paths["/me"].get.responses)).toEqual(
			expect.arrayContaining(["200", "401", "429"]),
		);
		expect(verifyApiKey).not.toHaveBeenCalled();
		expect(recordRelayApiUsage).not.toHaveBeenCalled();
		vi.unstubAllEnvs();
	});

	it("renders the reference page without a key", async () => {
		const response = await relayApp.request("/v1/docs");
		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toMatch(/text\/html/);
		const html = await response.text();
		expect(html).toContain("Scalar.createApiReference");
		expect(html).toContain("Relay API");
		expect(verifyApiKey).not.toHaveBeenCalled();
	});
});

describe("/v1 authentication", () => {
	it("rejects a request without a bearer token", async () => {
		const response = await relayApp.request("/v1/me");
		expect(response.status).toBe(401);
		expect(response.headers.get("X-Request-Id")).toMatch(/^req_[0-9A-HJKMNP-TV-Z]{26}$/);
		expect(response.headers.get("WWW-Authenticate")).toBe('Bearer realm="relay"');
		expect(await response.json()).toEqual({
			defined: false,
			code: "UNAUTHORIZED",
			status: 401,
			message: "Send the API key as `Authorization: Bearer <key>`",
			data: { reason: "MISSING_KEY" },
		});
		expect(verifyApiKey).not.toHaveBeenCalled();
		expect(recordRelayApiUsage).not.toHaveBeenCalled();
	});

	it("keeps the plugin's reason on a rejected key", async () => {
		verifyApiKey.mockResolvedValueOnce(failure("KEY_DISABLED") as never);
		const response = await relayApp.request("/v1/me", {
			headers: { Authorization: "Bearer relay_disabled" },
		});
		expect(response.status).toBe(401);
		expect(await response.json()).toMatchObject({
			code: "UNAUTHORIZED",
			data: { reason: "KEY_DISABLED" },
		});
		expect(verifyApiKey).toHaveBeenCalledWith({ body: { key: "relay_disabled" } });
	});

	it("turns the plugin's rate limit into 429 with Retry-After", async () => {
		verifyApiKey.mockResolvedValueOnce(failure("RATE_LIMITED", { tryAgainIn: 4_200 }) as never);
		const response = await relayApp.request("/v1/me", {
			headers: { Authorization: "Bearer relay_busy" },
		});
		expect(response.status).toBe(429);
		expect(response.headers.get("Retry-After")).toBe("5");
		expect(await response.json()).toMatchObject({ code: "TOO_MANY_REQUESTS", status: 429 });
	});

	it("turns an exhausted quota into 429 QUOTA_EXCEEDED", async () => {
		verifyApiKey.mockResolvedValueOnce(failure("USAGE_EXCEEDED") as never);
		const response = await relayApp.request("/v1/me", {
			headers: { Authorization: "Bearer relay_spent" },
		});
		expect(response.status).toBe(429);
		expect(await response.json()).toMatchObject({ code: "QUOTA_EXCEEDED", status: 429 });
	});
});

describe("GET /v1/me", () => {
	it("describes the key, adds rate limit headers and records the call", async () => {
		verifyApiKey.mockResolvedValueOnce({ valid: true, error: null, key } as never);
		const response = await relayApp.request("/v1/me", {
			headers: { Authorization: "Bearer relay_good" },
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			id: "key_1",
			name: "acceptance",
			organizationId: "org_1",
			permissions: {},
			rateLimit: { max: 300, windowMs: 60_000 },
			remaining: null,
			expiresAt: null,
		});
		expect(response.headers.get("X-RateLimit-Limit")).toBe("300");
		expect(response.headers.get("X-RateLimit-Remaining")).toBe("295");
		expect(response.headers.get("X-RateLimit-Reset")).toBe(
			String(Date.UTC(2026, 8, 11, 10, 1, 0) / 1000),
		);

		const requestId = response.headers.get("X-Request-Id");
		expect(recordRelayApiUsage).toHaveBeenCalledTimes(1);
		expect(recordRelayApiUsage).toHaveBeenCalledWith({
			apiKeyId: "key_1",
			organizationId: "org_1",
			method: "GET",
			path: "/v1/me",
			status: 200,
			durationMs: expect.any(Number),
			requestId,
		});
	});

	it("answers 404 in the same error shape for unknown routes", async () => {
		verifyApiKey.mockResolvedValueOnce({ valid: true, error: null, key } as never);
		const response = await relayApp.request("/v1/nope", {
			headers: { Authorization: "Bearer relay_good" },
		});
		expect(response.status).toBe(404);
		expect(response.headers.get("X-Request-Id")).toMatch(/^req_/);
		expect(await response.json()).toEqual({
			defined: false,
			code: "NOT_FOUND",
			status: 404,
			message: "No route for GET /v1/nope",
		});
		expect(recordRelayApiUsage).toHaveBeenCalledWith(
			expect.objectContaining({ path: "/v1/nope", status: 404 }),
		);
	});
});
