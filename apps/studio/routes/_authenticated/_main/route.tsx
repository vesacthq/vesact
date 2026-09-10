import { accountCenterUrl, loginUrl, onboardingUrl } from "@auth/lib/account-urls";
import { getOrganizationList, getSession } from "@auth/lib/auth-server.server";
import { listPurchases as listPurchasesProcedure } from "@repo/api/modules/payments/procedures/list-purchases";
import { config as authConfig } from "@repo/auth/config";
import { config as paymentsConfig } from "@repo/payments/config";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { AppWrapper } from "@shared/components/AppWrapper";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

const enforceMainAppGuardsForRouteFn = createServerFn({ method: "GET", strict: false })
	.validator((href: string) => href)
	.handler(async ({ data: href }) => {
		const session = await getSession();

		if (!session) {
			throw redirect({ href: loginUrl(href) });
		}

		if (authConfig.users.enableOnboarding && !session.user.onboardingComplete) {
			throw redirect({ href: onboardingUrl(href) });
		}

		const organizations = await getOrganizationList();

		if (authConfig.organizations.enable && authConfig.organizations.requireOrganization) {
			const organization =
				organizations.find((org) => org.id === session.session.activeOrganizationId) ||
				organizations[0];

			if (!organization) {
				throw redirect({ href: accountCenterUrl("/orgs/new", href) });
			}
		}

		if (paymentsConfig.requireActiveSubscription) {
			const organizationId = authConfig.organizations.enable
				? session.session.activeOrganizationId || organizations?.at(0)?.id
				: undefined;

			const purchases = await listPurchasesProcedure.callable({
				context: { headers: getRequestHeaders() },
			})({
				organizationId,
			});
			const { activePlan } = createPurchasesHelper(purchases);

			if (!activePlan) {
				const organization = organizations.find((org) => org.id === organizationId);
				throw redirect({
					href: accountCenterUrl(
						organization ? `/orgs/${organization.slug}/billing` : "/orgs",
						href,
					),
				});
			}
		}

		const cookie = getRequestHeaders().get("cookie") ?? "";
		return !/(?:^|;\s*)sidebar_state=false(?:;|$)/.test(cookie);
	});

export const Route = createFileRoute("/_authenticated/_main")({
	loader: async ({ location }) => {
		const sidebarDefaultOpen = await enforceMainAppGuardsForRouteFn({ data: location.href });
		return { sidebarDefaultOpen };
	},
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
