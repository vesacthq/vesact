import { useTranslations } from "@i18n/intl";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { MailCheckIcon } from "lucide-react";

export function InvitationAlert({ className }: { className?: string }) {
	const t = useTranslations();
	return (
		<Alert variant="primary" className={className}>
			<MailCheckIcon />
			<AlertTitle>{t("auth.invitation.title")}</AlertTitle>
			<AlertDescription>{t("auth.invitation.description")}</AlertDescription>
		</Alert>
	);
}
