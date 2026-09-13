import { InviteMemberForm } from "@organizations/components/InviteMemberForm";
import { OrganizationMembersBlock } from "@organizations/components/OrganizationMembersBlock";
import { useOrganization } from "@organizations/hooks/use-organization";
import { checkPermission } from "@repo/permissions";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/orgs/$organizationSlug/members/")({
	component: OrganizationMembersPage,
	head: () => ({ meta: [{ title: documentTitle("Members") }] }),
});

function OrganizationMembersPage() {
	const { role } = useOrganization();
	const canManage = checkPermission({ membershipRole: role }, "organization.manage");

	return (
		<SettingsList>
			{canManage && <InviteMemberForm />}
			<OrganizationMembersBlock />
		</SettingsList>
	);
}
