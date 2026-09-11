import { z } from "zod";

import { relayKeyProcedure } from "../procedures";

export const me = relayKeyProcedure
	.route({
		method: "GET",
		path: "/me",
		tags: ["Keys"],
		summary: "The calling key",
		description: "The API key that made the request and the organization it belongs to.",
	})
	.output(
		z.object({
			id: z.string(),
			name: z.string().nullable(),
			organizationId: z.string(),
			permissions: z.record(z.string(), z.array(z.string())),
			rateLimit: z.object({ max: z.number(), windowMs: z.number() }).nullable(),
			remaining: z.number().nullable(),
			expiresAt: z.iso.datetime().nullable(),
		}),
	)
	.handler(({ context }) => {
		const { key } = context;

		return {
			id: key.id,
			name: key.name ?? null,
			organizationId: key.referenceId,
			permissions: context.permissions,
			rateLimit:
				key.rateLimitEnabled && key.rateLimitMax !== null && key.rateLimitTimeWindow !== null
					? { max: key.rateLimitMax, windowMs: key.rateLimitTimeWindow }
					: null,
			remaining: key.remaining ?? null,
			expiresAt: key.expiresAt ? new Date(key.expiresAt).toISOString() : null,
		};
	});
