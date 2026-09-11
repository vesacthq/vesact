import { accountCenterUrl, onboardingUrl } from "@auth/lib/account-urls";
import { listPurchases as listPurchasesProcedure } from "@repo/api/modules/payments/procedures/list-purchases";
import { config as authConfig } from "@repo/auth/config";
import { config as paymentsConfig } from "@repo/payments/config";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { AppWrapper } from "@shared/components/AppWrapper";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

const hasActiveSubscriptionFn = createServerFn({ method: "GET", strict: false })
	.validator((data: { organizationId?: string }) => data)
	.handler(async ({ data: { organizationId } }) => {
		const purchases = await listPurchasesProcedure.callable({
			context: { headers: getRequestHeaders() },
		})({ organizationId });

		return { result: !!createPurchasesHelper(purchases).activePlan };
	});

const readCookies = createIsomorphicFn()
	.server(() => getRequestHeaders().get("cookie") ?? "")
	.client(() => document.cookie);

export const Route = createFileRoute("/_authenticated/_main")({
	beforeLoad: async ({ context: { session, organizations }, location }) => {
		if (authConfig.users.enableOnboarding && !session.user.onboardingComplete) {
			throw redirect({ href: onboardingUrl(location.href) });
		}

		if (authConfig.organizations.enable && authConfig.organizations.requireOrganization) {
			const organization =
				organizations.find((org) => org.id === session.session.activeOrganizationId) ||
				organizations[0];

			if (!organization) {
				throw redirect({ href: accountCenterUrl("/orgs/new", location.href) });
			}
		}

		if (paymentsConfig.requireActiveSubscription) {
			const organizationId = authConfig.organizations.enable
				? session.session.activeOrganizationId || organizations.at(0)?.id
				: undefined;
			const { result: hasActiveSubscription } = await hasActiveSubscriptionFn({
				data: { organizationId },
			});

			if (!hasActiveSubscription) {
				const organization = organizations.find((org) => org.id === organizationId);
				throw redirect({
					href: accountCenterUrl(
						organization ? `/orgs/${organization.slug}/billing` : "/orgs",
						location.href,
					),
				});
			}
		}
	},
	loader: () => ({
		sidebarDefaultOpen: !/(?:^|;\s*)sidebar_state=false(?:;|$)/.test(readCookies()),
	}),
	component: MainLayout,
});

function MainLayout() {
	const { sidebarDefaultOpen } = Route.useLoaderData();

	return (
		<AppWrapper defaultSidebarOpen={sidebarDefaultOpen}>
			<Outlet />
		</AppWrapper>
	);
}
