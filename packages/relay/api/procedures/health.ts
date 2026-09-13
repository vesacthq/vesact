import { healthOutput } from "../../contract";
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
	.output(healthOutput)
	.handler(() => ({ status: "ok" as const }));
