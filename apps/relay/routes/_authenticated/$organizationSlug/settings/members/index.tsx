import { useTranslations } from "@i18n/intl";
import { OrganizationMembersBlock } from "@organizations/components/OrganizationMembersBlock";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";

const organizationRoute = getRouteApi("/_authenticated/$organizationSlug");

export const Route = createFileRoute("/_authenticated/$organizationSlug/settings/members/")({
	component: MembersPage,
	head: () => ({ meta: [{ title: documentTitle("Members") }] }),
});

function MembersPage() {
	const { organization } = organizationRoute.useLoaderData();
	const t = useTranslations();

	return (
		<div>
			<PageHeader
				title={t("organizations.members.title")}
				subtitle={t("organizations.members.subtitle")}
			/>
			<OrganizationMembersBlock organizationSlug={organization.slug} />
		</div>
	);
}
