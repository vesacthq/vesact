import { UserList } from "@admin/components/users/UserList";
import { validateAdminListSearch } from "@admin/lib/list-search";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/admin/users/")({
	validateSearch: validateAdminListSearch,
	component: UserList,
	head: () => ({ meta: [{ title: documentTitle("Admin — Users") }] }),
});
