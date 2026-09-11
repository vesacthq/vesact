import { z } from "zod";

import { relayProcedure } from "../procedures";

export const health = relayProcedure
	.route({
		method: "GET",
		path: "/health",
		tags: ["Service"],
		summary: "Service health",
		description: "Answers without a key; use it to check that the API is reachable.",
		spec: (current) => ({ ...current, security: [] }),
	})
	.output(z.object({ status: z.literal("ok") }))
	.handler(() => ({ status: "ok" as const }));
