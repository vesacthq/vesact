import { accountSecurityUrl } from "@auth/lib/login-url";
import { useTranslations } from "@i18n/intl";
import { Button } from "@repo/ui/components/button";
import { SettingsItem } from "@shared/components/SettingsItem";
import { ExternalLinkIcon } from "lucide-react";

export function AccountSecurityLink() {
	const t = useTranslations();

	return (
		<SettingsItem
			title={t("settings.account.securityLink.title")}
			description={t("settings.account.securityLink.description")}
		>
			<Button
				variant="secondary"
				nativeButton={false}
				render={(props) => (
					<a {...props} href={accountSecurityUrl()}>
						<ExternalLinkIcon aria-hidden="true" />
						{t("settings.account.securityLink.open")}
					</a>
				)}
			/>
		</SettingsItem>
	);
}
