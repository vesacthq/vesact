import { useTranslations } from "@i18n/intl";
import { ActiveSessionsBlock } from "@settings/components/ActiveSessionsBlock";
import { ConnectedAccountsBlock } from "@settings/components/ConnectedAccountsBlock";
import { PasskeysBlock } from "@settings/components/PasskeysBlock";
import { PasswordAccountSettings } from "@settings/components/PasswordAccountSettings";
import { TwoFactorBlock } from "@settings/components/TwoFactorBlock";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/settings/security/")({
	component: SettingsSecurityPage,
	head: () => ({ meta: [{ title: documentTitle("Settings — Security") }] }),
});

function SettingsSecurityPage() {
	const t = useTranslations();

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">{t("settings.menu.account.security")}</h2>
			<SettingsList>
				<PasswordAccountSettings />
				<PasskeysBlock />
				<TwoFactorBlock />
				<ConnectedAccountsBlock />
				<ActiveSessionsBlock />
			</SettingsList>
		</div>
	);
}
