import { activeOrganizationQueryOptions } from "@organizations/lib/api";
import { config as authConfig } from "@repo/auth/config";
import { checkPermission } from "@repo/permissions";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/$organizationSlug")({
	beforeLoad: () => {
		if (!authConfig.organizations.enable) {
			throw redirect({ to: "/" });
		}
	},
	loader: async ({ params, context: { queryClient, session, activeOrganization } }) => {
		const organization =
			activeOrganization?.slug === params.organizationSlug
				? activeOrganization
				: await queryClient.ensureQueryData(
						activeOrganizationQueryOptions({ slug: params.organizationSlug }),
					);

		const membership = organization?.members.find((member) => member.userId === session.user.id);

		if (
			!organization ||
			!checkPermission({ user: session.user, membershipRole: membership?.role }, "studio.access")
		) {
			throw notFound();
		}
	},
});
