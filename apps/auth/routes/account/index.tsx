import { ActiveSessionsBlock } from "@account/components/ActiveSessionsBlock";
import { ConnectedAccountsBlock } from "@account/components/ConnectedAccountsBlock";
import { DeleteAccountForm } from "@account/components/DeleteAccountForm";
import { PasskeysBlock } from "@account/components/PasskeysBlock";
import { PasswordAccountSettings } from "@account/components/PasswordAccountSettings";
import { TwoFactorBlock } from "@account/components/TwoFactorBlock";
import { useTranslations } from "@i18n/intl";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/")({
	component: AccountSecurityPage,
	head: () => ({ meta: [{ title: documentTitle("Account security") }] }),
});

function AccountSecurityPage() {
	const t = useTranslations();

	return (
		<div>
			<h1 className="mb-1 font-bold text-2xl">{t("settings.account.security.title")}</h1>
			<p className="mb-6 text-foreground/60">{t("settings.account.subtitle")}</p>
			<SettingsList>
				<PasswordAccountSettings />
				<PasskeysBlock />
				<TwoFactorBlock />
				<ConnectedAccountsBlock />
				<ActiveSessionsBlock />
				<DeleteAccountForm />
			</SettingsList>
		</div>
	);
}
