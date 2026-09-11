import { getSession } from "@auth/lib/auth-server.server";
import { useTranslations } from "@i18n/intl";
import { checkPermission } from "@repo/permissions";
import { PageHeader } from "@shared/components/PageHeader";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const requireAdminAccessFn = createServerFn({ method: "GET", strict: false })
	.validator((href: string) => href)
	.handler(async ({ data: href }) => {
		const session = await getSession();

		if (!session) {
			throw redirect({ to: "/login", search: { redirectTo: href } });
		}

		// admin.access is user-scoped: it needs no organization context.
		if (!checkPermission({ user: session.user }, "admin.access")) {
			throw redirect({ to: "/account" });
		}
	});

export const Route = createFileRoute("/_authenticated/_settings/admin")({
	beforeLoad: async ({ location }) => {
		await requireAdminAccessFn({ data: location.href });
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
