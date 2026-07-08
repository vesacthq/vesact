import { useTranslations } from "@i18n/intl";
import { InviteMemberForm } from "@organizations/components/InviteMemberForm";
import { OrganizationMembersBlock } from "@organizations/components/OrganizationMembersBlock";
import { useActiveOrganizationQuery } from "@organizations/lib/api";
import { config as authConfig } from "@repo/auth/config";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/$organizationSlug/settings/members/")({
	beforeLoad: () => {
		if (!authConfig.organizations.enable) {
			throw redirect({ to: "/" });
		}
	},
	component: OrgSettingsMembersPage,
	head: () => ({ meta: [{ title: "Organization — Members" }] }),
});

function OrgSettingsMembersPage() {
	const { organizationSlug } = Route.useParams();
	const t = useTranslations();
	const { data, isError, isLoading } = useActiveOrganizationQuery(
		{ slug: organizationSlug },
		{ enabled: Boolean(organizationSlug) },
	);

	if (isError || !data) {
		return isLoading ? (
			<p className="text-sm text-muted-foreground">…</p>
		) : (
			<p className="text-sm text-destructive">Could not load organization.</p>
		);
	}

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">{t("settings.menu.organization.members")}</h2>
			<InviteMemberForm organizationId={data.id} />
			<div className="mt-6">
				<OrganizationMembersBlock organizationId={data.id} />
			</div>
		</div>
	);
}
