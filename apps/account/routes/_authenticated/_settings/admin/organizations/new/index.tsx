import { OrganizationForm } from "@admin/components/organizations/OrganizationForm";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/admin/organizations/new/")({
	component: () => <OrganizationForm organizationId="new" />,
	head: () => ({ meta: [{ title: documentTitle("Admin — New organization") }] }),
});
