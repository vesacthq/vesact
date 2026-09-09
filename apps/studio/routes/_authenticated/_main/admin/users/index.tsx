import { UserList } from "@admin/components/users/UserList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/admin/users/")({
	component: AdminUsersPage,
	head: () => ({ meta: [{ title: documentTitle("Admin — Users") }] }),
});

function AdminUsersPage() {
	return (
		<div className="p-2">
			<UserList />
		</div>
	);
}
