import { describe, expect, it } from "vitest";

import { mapVerifyError, missingKey, rateLimitHeaders } from "./verify";

describe("mapVerifyError", () => {
	it.each(["KEY_NOT_FOUND", "KEY_EXPIRED", "KEY_DISABLED", "INVALID_API_KEY"])(
		"maps %s to 401 UNAUTHORIZED and keeps the reason",
		(code) => {
			expect(mapVerifyError({ code })).toEqual({
				status: 401,
				code: "UNAUTHORIZED",
				message: "Invalid API key",
				data: { reason: code },
			});
		},
	);

	it("maps RATE_LIMITED to 429 TOO_MANY_REQUESTS with Retry-After in whole seconds", () => {
		expect(mapVerifyError({ code: "RATE_LIMITED", details: { tryAgainIn: 12_345 } })).toEqual({
			status: 429,
			code: "TOO_MANY_REQUESTS",
			message: "Rate limit exceeded",
			retryAfterSeconds: 13,
		});
		expect(mapVerifyError({ code: "RATE_LIMITED" }).retryAfterSeconds).toBe(1);
	});

	it("maps USAGE_EXCEEDED to 429 QUOTA_EXCEEDED", () => {
		expect(mapVerifyError({ code: "USAGE_EXCEEDED" })).toEqual({
			status: 429,
			code: "QUOTA_EXCEEDED",
			message: "Quota exceeded",
		});
	});

	it("treats a missing error as an invalid key", () => {
		expect(mapVerifyError(null).data).toEqual({ reason: "INVALID_API_KEY" });
	});

	it("names the missing header", () => {
		expect(missingKey().data).toEqual({ reason: "MISSING_KEY" });
	});
});

describe("rateLimitHeaders", () => {
	const key = {
		rateLimitEnabled: true,
		rateLimitMax: 300,
		rateLimitTimeWindow: 60_000,
		requestCount: 5,
		lastRequest: new Date("2026-09-11T10:00:00.000Z"),
	};

	it("reports the limit, what is left and when the window can reset", () => {
		expect(rateLimitHeaders(key)).toEqual({
			"X-RateLimit-Limit": "300",
			"X-RateLimit-Remaining": "295",
			"X-RateLimit-Reset": String(Date.UTC(2026, 8, 11, 10, 1, 0) / 1000),
		});
	});

	it("never reports a negative remaining count", () => {
		expect(rateLimitHeaders({ ...key, requestCount: 301 })["X-RateLimit-Remaining"]).toBe("0");
	});

	it("sends nothing for keys without a limit", () => {
		expect(rateLimitHeaders({ ...key, rateLimitEnabled: false })).toEqual({});
		expect(rateLimitHeaders({ ...key, rateLimitMax: null })).toEqual({});
	});
});
