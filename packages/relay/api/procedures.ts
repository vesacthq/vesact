import { ORPCError, os } from "@orpc/server";
import { z } from "zod";

import type { RelayContext } from "./context";

export const relayProcedure = os.$context<RelayContext>();

/**
 * Every business endpoint builds on this. The key was verified before oRPC
 * runs (see app.ts); the errors are declared here so the OpenAPI document
 * lists them, and the guard keeps the procedures safe to mount elsewhere.
 */
export const relayKeyProcedure = relayProcedure
	.errors({
		UNAUTHORIZED: {
			message: "Invalid API key",
			data: z.object({ reason: z.string() }),
		},
		TOO_MANY_REQUESTS: { message: "Rate limit exceeded" },
		QUOTA_EXCEEDED: { status: 429, message: "Quota exceeded" },
	})
	.use(({ context, procedure, next }) => {
		if (!context.auth) {
			throw new ORPCError("UNAUTHORIZED", { data: { reason: "MISSING_KEY" } });
		}

		context.trace.path = procedure["~orpc"].route.path;
		return next({ context: { auth: context.auth } });
	});
