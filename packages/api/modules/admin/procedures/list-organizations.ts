import { countAllOrganizations, getOrganizations, OrganizationSchema } from "@repo/database";
import { z } from "zod";

import { adminProcedure } from "../../../orpc/procedures";

export const listOrganizations = adminProcedure
	.route({
		method: "GET",
		path: "/admin/organizations",
		tags: ["Administration"],
		summary: "List organizations",
	})
	.input(
		z.object({
			query: z.string().optional(),
			limit: z.number().min(1).max(100).default(10),
			offset: z.number().min(0).default(0),
		}),
	)
	.output(
		z.object({
			organizations: z.array(
				OrganizationSchema.extend({
					membersCount: z.number().int().nonnegative(),
				}),
			),
			total: z.number().int().nonnegative(),
		}),
	)
	.handler(async ({ input: { query, limit, offset } }) => {
		const organizations = await getOrganizations({
			limit,
			offset,
			query,
		});

		const total = await countAllOrganizations({ query });

		return { organizations, total };
	});
