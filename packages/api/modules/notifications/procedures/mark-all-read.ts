import { markAllNotificationsAsReadForUser } from "@repo/database";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const markAllNotificationsRead = protectedProcedure
	.route({
		method: "POST",
		path: "/notifications/mark-all-read",
		tags: ["Notifications"],
		summary: "Mark all notifications as read",
	})
	.input(z.object({}).optional())
	.output(
		z.object({
			ok: z.literal(true),
		}),
	)
	.handler(async ({ context: { user } }) => {
		await markAllNotificationsAsReadForUser(user.id);
		return { ok: true };
	});
