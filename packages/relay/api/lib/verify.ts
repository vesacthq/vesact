import type { RelayHttpError } from "./errors";

export interface VerifyFailure {
	code?: string;
	details?: { tryAgainIn?: number };
}

export interface RateLimitFields {
	rateLimitEnabled: boolean;
	rateLimitMax: number | null;
	rateLimitTimeWindow: number | null;
	requestCount: number;
	lastRequest: Date | string | null;
}

export function missingKey(): RelayHttpError {
	return {
		status: 401,
		code: "UNAUTHORIZED",
		message: "Send the API key as `Authorization: Bearer <key>`",
		data: { reason: "MISSING_KEY" },
	};
}

/**
 * The api-key plugin reports why a key was rejected; the reason survives in
 * `data.reason` while the public code stays one of three.
 */
export function mapVerifyError(error: VerifyFailure | null | undefined): RelayHttpError {
	const reason = error?.code ?? "INVALID_API_KEY";

	switch (reason) {
		case "RATE_LIMITED":
			return {
				status: 429,
				code: "TOO_MANY_REQUESTS",
				message: "Rate limit exceeded",
				retryAfterSeconds: Math.max(1, Math.ceil((error?.details?.tryAgainIn ?? 0) / 1000)),
			};
		case "USAGE_EXCEEDED":
			return { status: 429, code: "QUOTA_EXCEEDED", message: "Quota exceeded" };
		default:
			return {
				status: 401,
				code: "UNAUTHORIZED",
				message: "Invalid API key",
				data: { reason },
			};
	}
}

/**
 * The plugin counts requests in a window that ends one `rateLimitTimeWindow`
 * after the latest request, so the reset time moves with every call.
 */
export function rateLimitHeaders(key: RateLimitFields): Record<string, string> {
	if (!key.rateLimitEnabled || key.rateLimitMax === null || key.rateLimitTimeWindow === null) {
		return {};
	}

	const lastRequest = key.lastRequest ? new Date(key.lastRequest).getTime() : Date.now();

	return {
		"X-RateLimit-Limit": String(key.rateLimitMax),
		"X-RateLimit-Remaining": String(Math.max(0, key.rateLimitMax - key.requestCount)),
		"X-RateLimit-Reset": String(Math.ceil((lastRequest + key.rateLimitTimeWindow) / 1000)),
	};
}
