import { accountCenterUrl } from "@auth/lib/account-urls";
import { useTranslations } from "@i18n/intl";
import { OrganizationsGrid } from "@organizations/components/OrganizationsGrid";
import { config as authConfig } from "@repo/auth/config";
import { Card } from "@repo/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/")({
	beforeLoad: ({ context: { session, organizations }, location }) => {
		if (authConfig.organizations.enable && authConfig.organizations.requireOrganization) {
			const organization =
				organizations.find((org) => org.id === session.session.activeOrganizationId) ||
				organizations[0];

			if (!organization) {
				throw redirect({ href: accountCenterUrl("/orgs/new", location.href) });
			}

			throw redirect({ href: `/${organization.slug}` });
		}
	},
	component: DashboardHome,
	head: () => ({ meta: [{ title: documentTitle("Start") }] }),
});

function DashboardHome() {
	const { session } = Route.useRouteContext();
	const t = useTranslations();

	return (
		<div className="">
			<PageHeader
				title={t("start.welcome", { name: session.user.name })}
				subtitle={t("start.subtitle")}
			/>

			<div>
				{authConfig.organizations.enable && <OrganizationsGrid />}

				<Card className="mt-6">
					<div className="h-64 p-8 flex items-center justify-center text-foreground/60">
						Place your content here...
					</div>
				</Card>
			</div>
		</div>
	);
}
