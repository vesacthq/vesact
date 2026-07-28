import { getUnreadNotificationCountByUserId } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const unreadCount = protectedProcedure
	.route({
		method: "GET",
		path: "/notifications/unread-count",
		tags: ["Notifications"],
		summary: "Count unread notifications",
	})
	.input(z.object({}).optional())
	.output(
		z.object({
			count: z.number().int().nonnegative(),
		}),
	)
	.handler(async ({ context: { user } }) => {
		const count = await getUnreadNotificationCountByUserId(user.id);
		return { count };
	});
