import { auth } from "@repo/auth";
import { getOrganizationMembership } from "@repo/database";
import { createPermissionRules } from "@repo/permissions";

export async function buildPermissionRulesForRequest(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	let membershipRole: string | null = null;

	if (session?.session.activeOrganizationId) {
		const membership = await getOrganizationMembership(
			session.session.activeOrganizationId,
			session.user.id,
		);
		membershipRole = membership?.role ?? null;
	}

	return createPermissionRules({
		user: session?.user ?? null,
		membershipRole,
	});
}
