import { ORPCError } from "@orpc/client";

export interface RelayHttpError {
	status: 401 | 404 | 429 | 500;
	code:
		| "UNAUTHORIZED"
		| "NOT_FOUND"
		| "TOO_MANY_REQUESTS"
		| "QUOTA_EXCEEDED"
		| "INTERNAL_SERVER_ERROR";
	message: string;
	data?: { reason: string };
	retryAfterSeconds?: number;
}

export interface ErrorPayload {
	status: RelayHttpError["status"];
	headers: Record<string, string>;
	body: string;
}

/**
 * Errors raised before a procedure runs still answer in oRPC's error shape,
 * so every `/v1` error body looks the same to a client.
 */
export function errorPayload(error: RelayHttpError): ErrorPayload {
	const headers: Record<string, string> = { "Content-Type": "application/json" };

	if (error.status === 401) {
		headers["WWW-Authenticate"] = 'Bearer realm="relay"';
	}

	if (error.retryAfterSeconds !== undefined) {
		headers["Retry-After"] = String(error.retryAfterSeconds);
	}

	const body = new ORPCError(error.code, {
		status: error.status,
		message: error.message,
		data: error.data,
	}).toJSON();

	return { status: error.status, headers, body: JSON.stringify(body) };
}

export function notFoundError(method: string, pathname: string): RelayHttpError {
	return { status: 404, code: "NOT_FOUND", message: `No route for ${method} ${pathname}` };
}

export function internalError(): RelayHttpError {
	return { status: 500, code: "INTERNAL_SERVER_ERROR", message: "Internal server error" };
}

export function notFoundResponse(method: string, pathname: string): Response {
	const { status, headers, body } = errorPayload(notFoundError(method, pathname));
	return new Response(body, { status, headers });
}
