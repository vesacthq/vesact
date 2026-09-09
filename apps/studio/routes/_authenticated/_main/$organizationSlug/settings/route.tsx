import { useTranslations } from "@i18n/intl";
import { config as authConfig } from "@repo/auth/config";
import { PageHeader } from "@shared/components/PageHeader";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/$organizationSlug/settings")({
	beforeLoad: () => {
		if (!authConfig.organizations.enable) {
			throw redirect({ to: "/" });
		}
	},
	component: OrganizationSettingsLayout,
});

function OrganizationSettingsLayout() {
	const t = useTranslations();

	return (
		<div>
			<PageHeader
				title={t("organizations.settings.title")}
				subtitle={t("organizations.settings.subtitle")}
			/>
			<div className="mt-8">
				<Outlet />
			</div>
		</div>
	);
}
