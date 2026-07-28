import {
	getUnreadNotificationCountByUserId,
	listNotificationsByUserId,
	NotificationSchema,
} from "@repo/database";
import { resolveNotificationLink } from "@repo/notifications";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const list = protectedProcedure
	.route({
		method: "GET",
		path: "/notifications",
		tags: ["Notifications"],
		summary: "List in-app notifications",
	})
	.input(
		z
			.object({
				limit: z.number().int().min(1).max(50).optional(),
			})
			.optional(),
	)
	.output(
		z.object({
			items: z.array(NotificationSchema),
			unreadCount: z.number().int().nonnegative(),
		}),
	)
	.handler(async ({ input, context: { user } }) => {
		const limit = input?.limit ?? 20;
		const [items, unreadCount] = await Promise.all([
			listNotificationsByUserId(user.id, limit),
			getUnreadNotificationCountByUserId(user.id),
		]);
		return {
			items: items.map((item) => ({
				...item,
				link: resolveNotificationLink(item.link),
			})),
			unreadCount,
		};
	});
