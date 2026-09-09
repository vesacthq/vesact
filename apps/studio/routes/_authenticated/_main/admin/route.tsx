import { useTranslations } from "@i18n/intl";
import { checkPermission } from "@repo/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const requireAdminAccessFn = createServerFn({
	method: "GET",
	strict: false,
}).handler(async () => {
	const { getSession } = await import("@auth/lib/auth-server.server");
	const session = await getSession();

	if (!session) {
		throw redirect({ href: "/login" });
	}

	// admin.access is user-scoped — do not depend on request-middleware Permix
	// context (getOrThrow) for this gate.
	if (!checkPermission({ user: session.user }, "admin.access")) {
		throw redirect({ href: "/" });
	}
});

export const Route = createFileRoute("/_authenticated/_main/admin")({
	beforeLoad: async () => {
		await requireAdminAccessFn();
	},
	component: AdminLayout,
});

function AdminLayout() {
	const t = useTranslations();

	return (
		<>
			<PageHeader title={t("admin.title")} subtitle={t("admin.description")} />
			<Outlet />
		</>
	);
}
