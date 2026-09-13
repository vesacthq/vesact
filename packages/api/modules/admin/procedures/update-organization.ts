import { ORPCError } from "@orpc/server";
import { config as authConfig } from "@repo/auth/config";
import {
	getOrganizationById as getOrganizationByIdFn,
	getOrganizationBySlug,
	updateOrganization as updateOrganizationFn,
} from "@repo/database";
import { z } from "zod";

import { adminProcedure } from "../../../orpc/procedures";
import { AdminOrganizationSchema } from "../lib/schemas";

export const updateOrganization = adminProcedure
	.route({
		method: "PATCH",
		path: "/admin/organizations/{id}",
		tags: ["Administration"],
		summary: "Update organization",
	})
	.input(
		z.object({
			id: z.string(),
			name: z.string().trim().min(1).max(100),
			slug: z.string().trim().min(1).max(100).optional(),
		}),
	)
	.output(AdminOrganizationSchema)
	.handler(async ({ input: { id, name, slug } }) => {
		if (slug) {
			// Better Auth's /organization/update hook rejects these; this path bypasses it.
			if (
				(authConfig.organizations.forbiddenOrganizationSlugs as readonly string[]).includes(
					slug.toLowerCase(),
				)
			) {
				throw new ORPCError("BAD_REQUEST", { message: "This organization slug is reserved." });
			}

			const existing = await getOrganizationBySlug(slug);

			if (existing && existing.id !== id) {
				throw new ORPCError("CONFLICT", { message: "This organization slug is already in use." });
			}
		}

		await updateOrganizationFn({ id, name, ...(slug ? { slug } : {}) });

		const organization = await getOrganizationByIdFn(id);

		if (!organization) {
			throw new ORPCError("NOT_FOUND");
		}

		return organization;
	});
