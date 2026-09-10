import { NotificationPreferencesForm } from "@account/components/NotificationPreferencesForm";
import { useTranslations } from "@i18n/intl";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/account/notifications/")({
	component: NotificationsPage,
	head: () => ({ meta: [{ title: documentTitle("Notifications") }] }),
});

function NotificationsPage() {
	const t = useTranslations("settings.notificationsPage");

	return (
		<div>
			<PageHeader title={t("title")} subtitle={t("description")} />
			<NotificationPreferencesForm />
		</div>
	);
}
