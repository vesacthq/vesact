import { useTranslations } from "@i18n/intl";
import { checkPermission } from "@repo/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/admin")({
	beforeLoad: ({ context: { session } }) => {
		// admin.access is user-scoped: it needs no organization context.
		if (!checkPermission({ user: session.user }, "admin.access")) {
			throw redirect({ to: "/account" });
		}
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
