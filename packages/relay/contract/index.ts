import { z } from "zod";

// The shapes of /v1, without runtime dependencies: Studio and other clients
// import these; the procedures in ../api validate against the same objects.

export const healthOutput = z.object({ status: z.literal("ok") });

export const apiKeyOutput = z.object({
	id: z.string(),
	name: z.string().nullable(),
	organizationId: z.string(),
	permissions: z.record(z.string(), z.array(z.string())),
	rateLimit: z.object({ max: z.number(), windowMs: z.number() }).nullable(),
	remaining: z.number().nullable(),
	expiresAt: z.iso.datetime().nullable(),
});

export type HealthOutput = z.infer<typeof healthOutput>;
export type ApiKeyOutput = z.infer<typeof apiKeyOutput>;

export type { RelayRouter } from "../api/router";
