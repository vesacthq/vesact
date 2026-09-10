import { OrganizationList } from "@admin/components/organizations/OrganizationList";
import { validateAdminListSearch } from "@admin/lib/list-search";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/admin/organizations/")({
	validateSearch: validateAdminListSearch,
	component: OrganizationList,
	head: () => ({ meta: [{ title: documentTitle("Admin — Organizations") }] }),
});
