import { OrganizationForm } from "@admin/components/organizations/OrganizationForm";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authenticated/_settings/admin/organizations/$organizationId/",
)({
	component: AdminOrganizationPage,
	head: () => ({ meta: [{ title: documentTitle("Admin — Organization") }] }),
});

function AdminOrganizationPage() {
	const { organizationId } = Route.useParams();

	return <OrganizationForm organizationId={organizationId} />;
}
