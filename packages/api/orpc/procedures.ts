import { ORPCError, os } from "@orpc/server";
import { auth } from "@repo/auth";
import { getOrganizationMembership } from "@repo/database";
import { createPermissionRules } from "@repo/permissions";

import { permix } from "./permix";

export const publicProcedure = os.$context<{
	headers: Headers;
}>();

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
	const session = await auth.api.getSession({
		headers: context.headers,
	});

	if (!session) {
		throw new ORPCError("UNAUTHORIZED");
	}

	let membershipRole: string | null = null;

	if (session.session.activeOrganizationId) {
		const membership = await getOrganizationMembership(
			session.session.activeOrganizationId,
			session.user.id,
		);
		membershipRole = membership?.role ?? null;
	}

	return await next({
		context: {
			session: session.session,
			user: session.user,
			...permix.setupContext(
				createPermissionRules({
					user: session.user,
					membershipRole,
				}),
			),
		},
	});
});

export const adminProcedure = protectedProcedure.use(permix.checkMiddleware("admin.access"));
