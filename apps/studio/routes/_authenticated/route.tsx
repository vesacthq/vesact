import { SessionProvider } from "@auth/components/SessionProvider";
import { loginUrl } from "@auth/lib/account-urls";
import { sessionQueryOptions } from "@auth/lib/api";
import { ActiveOrganizationProvider } from "@organizations/components/ActiveOrganizationProvider";
import {
	activeOrganizationQueryOptions,
	organizationListQueryOptions,
} from "@organizations/lib/api";
import { createPermissionRules } from "@repo/permissions";
import { ConfirmationAlertProvider } from "@shared/components/ConfirmationAlertProvider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PermixHydrate } from "permix/react";

/**
 * One read per page load: the session, the active organization and the list
 * land in the query cache, so client-side navigation reuses them and the
 * child guards run on the route context alone.
 */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context: { queryClient, permix }, location }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());

		if (!session) {
			throw redirect({ href: loginUrl(location.href) });
		}

		const activeOrganizationId = session.session.activeOrganizationId;
		const [activeOrganization, organizations] = await Promise.all([
			activeOrganizationId
				? queryClient.ensureQueryData(activeOrganizationQueryOptions({ id: activeOrganizationId }))
				: null,
			queryClient.ensureQueryData(organizationListQueryOptions()),
		]);

		const membershipRole =
			activeOrganization?.members.find((member) => member.userId === session.user.id)?.role ?? null;
		permix.setup(createPermissionRules({ user: session.user, membershipRole }));

		return { session, activeOrganization, organizations, permixState: permix.dehydrate() };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { activeOrganization, session, permixState } = Route.useRouteContext();

	return (
		<PermixHydrate state={permixState}>
			<SessionProvider initialSession={session}>
				<ActiveOrganizationProvider initialActiveOrganization={activeOrganization}>
					<ConfirmationAlertProvider>
						<Outlet />
					</ConfirmationAlertProvider>
				</ActiveOrganizationProvider>
			</SessionProvider>
		</PermixHydrate>
	);
}
