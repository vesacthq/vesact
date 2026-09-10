import { z } from "zod";

import { publicProcedure } from "../../../orpc/procedures";

export const availability = publicProcedure
	.route({
		method: "GET",
		path: "/payments/availability",
		tags: ["Payments"],
		summary: "Payment availability",
		description: "Whether checkout is possible: a payment provider is configured",
	})
	.output(
		z.object({
			checkout: z.boolean(),
		}),
	)
	.handler(() => ({
		checkout: Boolean(process.env.STRIPE_SECRET_KEY),
	}));
