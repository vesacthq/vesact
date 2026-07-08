import { useTranslations } from "@i18n/intl";
import { PageHeader } from "@shared/components/PageHeader";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/settings")({
	component: AccountSettingsLayout,
});

function AccountSettingsLayout() {
	const t = useTranslations();

	return (
		<div>
			<PageHeader title={t("settings.account.title")} subtitle={t("settings.account.subtitle")} />
			<div className="mt-8">
				<Outlet />
			</div>
		</div>
	);
}
