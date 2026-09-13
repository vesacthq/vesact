import { ChangeOrganizationNameForm } from "@organizations/components/ChangeOrganizationNameForm";
import { DeleteOrganizationForm } from "@organizations/components/DeleteOrganizationForm";
import { OrganizationLogoForm } from "@organizations/components/OrganizationLogoForm";
import { useOrganization } from "@organizations/hooks/use-organization";
import { checkPermission } from "@repo/permissions";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/orgs/$organizationSlug/")({
	component: OrganizationGeneralPage,
	head: () => ({ meta: [{ title: documentTitle("Organization") }] }),
});

function OrganizationGeneralPage() {
	const { role } = useOrganization();
	const canManage = checkPermission({ membershipRole: role }, "organization.manage");
	const canDelete = checkPermission({ membershipRole: role }, "organization.delete");

	return (
		<SettingsList>
			<OrganizationLogoForm disabled={!canManage} />
			<ChangeOrganizationNameForm disabled={!canManage} />
			{canDelete && <DeleteOrganizationForm />}
		</SettingsList>
	);
}
