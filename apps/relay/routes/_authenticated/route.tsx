import { accountCenterUrl, loginUrl, onboardingUrl } from "@auth/lib/account-urls";
import { sessionQueryOptions } from "@auth/lib/api";
import { organizationListQueryOptions } from "@organizations/lib/api";
import { config as authConfig } from "@repo/auth/config";
import { AppWrapper } from "@shared/components/AppWrapper";
import { ConfirmationAlertProvider } from "@shared/components/ConfirmationAlertProvider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

const readCookies = createIsomorphicFn()
	.server(() => getRequestHeaders().get("cookie") ?? "")
	.client(() => document.cookie);

/**
 * One read per page load: the session and the organization list land in the
 * query cache and the route context, so client-side navigation reuses them.
 * Identity flows and organization creation live in the account center.
 */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());

		if (!session) {
			throw redirect({ href: loginUrl(location.href) });
		}

		if (authConfig.users.enableOnboarding && !session.user.onboardingComplete) {
			throw redirect({ href: onboardingUrl(location.href) });
		}

		const organizations = await queryClient.ensureQueryData(organizationListQueryOptions());

		// Keys belong to organizations, so Relay has no personal-account mode.
		if (organizations.length === 0) {
			throw redirect({ href: accountCenterUrl("/orgs/new", location.href) });
		}

		return { session, organizations };
	},
	loader: () => ({
		sidebarDefaultOpen: !/(?:^|;\s*)sidebar_state=false(?:;|$)/.test(readCookies()),
	}),
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { sidebarDefaultOpen } = Route.useLoaderData();

	return (
		<ConfirmationAlertProvider>
			<AppWrapper defaultSidebarOpen={sidebarDefaultOpen}>
				<Outlet />
			</AppWrapper>
		</ConfirmationAlertProvider>
	);
}
