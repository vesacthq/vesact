import { ORPCError } from "@orpc/server";
import {
	deleteOrganization as deleteOrganizationFn,
	getOrganizationById as getOrganizationByIdFn,
	getPurchasesByOrganizationId,
} from "@repo/database";
import { cancelSubscription } from "@repo/payments";
import { z } from "zod";

import { adminProcedure } from "../../../orpc/procedures";

export const deleteOrganization = adminProcedure
	.route({
		method: "DELETE",
		path: "/admin/organizations/{id}",
		tags: ["Administration"],
		summary: "Delete organization",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.output(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input: { id } }) => {
		const organization = await getOrganizationByIdFn(id);

		if (!organization) {
			throw new ORPCError("NOT_FOUND");
		}

		// Better Auth's /organization/delete hook ends the subscriptions; this path bypasses it.
		const purchases = await getPurchasesByOrganizationId(id);

		for (const purchase of purchases) {
			if (purchase.type === "SUBSCRIPTION" && purchase.subscriptionId) {
				await cancelSubscription(purchase.subscriptionId);
			}
		}

		await deleteOrganizationFn(id);

		return { id };
	});
