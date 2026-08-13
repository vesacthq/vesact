import { useTranslations } from "@i18n/intl";
import { NotificationPreferencesForm } from "@settings/components/NotificationPreferencesForm";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/settings/notifications/")({
	component: SettingsNotificationsPage,
	head: () => ({ meta: [{ title: documentTitle("Settings — Notifications") }] }),
});

function SettingsNotificationsPage() {
	const t = useTranslations("settings.notificationsPage");

	return (
		<div>
			<h2 className="mb-2 font-semibold text-lg">{t("title")}</h2>
			<p className="mb-4 text-sm text-muted-foreground">{t("description")}</p>
			<SettingsList>
				<NotificationPreferencesForm />
			</SettingsList>
		</div>
	);
}
