import { OrganizationForm } from "@admin/components/organizations/OrganizationForm";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/admin/organizations/new/")({
	component: AdminNewOrganizationPage,
	head: () => ({ meta: [{ title: documentTitle("Admin — New organization") }] }),
});

function AdminNewOrganizationPage() {
	return (
		<div className="max-w-lg p-2 mx-auto">
			<OrganizationForm organizationId="new" />
		</div>
	);
}
