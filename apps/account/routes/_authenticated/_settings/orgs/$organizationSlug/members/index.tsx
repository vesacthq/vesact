import { InviteMemberForm } from "@organizations/components/InviteMemberForm";
import { OrganizationMembersBlock } from "@organizations/components/OrganizationMembersBlock";
import { useOrganization } from "@organizations/hooks/use-organization";
import { checkPermission, serializeMemberRoles } from "@repo/permissions";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/orgs/$organizationSlug/members/")({
	component: OrganizationMembersPage,
	head: () => ({ meta: [{ title: documentTitle("Members") }] }),
});

function OrganizationMembersPage() {
	const { roles } = useOrganization();
	const canManage = checkPermission(
		{ membershipRole: serializeMemberRoles(roles) },
		"organization.manage",
	);

	return (
		<SettingsList>
			{canManage && <InviteMemberForm />}
			<OrganizationMembersBlock />
		</SettingsList>
	);
}
