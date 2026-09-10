import { ActiveSessionsBlock } from "@account/components/ActiveSessionsBlock";
import { ConnectedAccountsBlock } from "@account/components/ConnectedAccountsBlock";
import { PasskeysBlock } from "@account/components/PasskeysBlock";
import { PasswordAccountSettings } from "@account/components/PasswordAccountSettings";
import { TwoFactorBlock } from "@account/components/TwoFactorBlock";
import { useTranslations } from "@i18n/intl";
import { PageHeader } from "@shared/components/PageHeader";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/account/security/")({
	component: SecurityPage,
	head: () => ({ meta: [{ title: documentTitle("Security") }] }),
});

function SecurityPage() {
	const t = useTranslations();

	return (
		<div>
			<PageHeader
				title={t("settings.account.security.title")}
				subtitle={t("settings.account.security.subtitle")}
			/>
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
