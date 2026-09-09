import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/admin/")({
	beforeLoad: () => {
		throw redirect({ href: "/admin/users" });
	},
	component: () => null,
});
