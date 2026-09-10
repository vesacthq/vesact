import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/admin/")({
	beforeLoad: ({ search }) => {
		throw redirect({ to: "/admin/users", search });
	},
	component: () => null,
});
