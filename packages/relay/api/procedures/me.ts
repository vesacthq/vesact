import { apiKeyOutput } from "../../contract";
import { relayKeyProcedure } from "../procedures";

export const me = relayKeyProcedure
	.route({
		method: "GET",
		path: "/me",
		tags: ["Keys"],
		summary: "The calling key",
		description: "The API key that made the request and the organization it belongs to.",
	})
	.output(apiKeyOutput)
	.handler(({ context }) => {
		const { key, permissions } = context.auth;

		return {
			id: key.id,
			name: key.name ?? null,
			organizationId: key.referenceId,
			permissions,
			rateLimit:
				key.rateLimitEnabled && key.rateLimitMax !== null && key.rateLimitTimeWindow !== null
					? { max: key.rateLimitMax, windowMs: key.rateLimitTimeWindow }
					: null,
			remaining: key.remaining ?? null,
			expiresAt: key.expiresAt ? new Date(key.expiresAt).toISOString() : null,
		};
	});
