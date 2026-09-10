import { useTranslations } from "@i18n/intl";
import { AccountSecurityLink } from "@settings/components/AccountSecurityLink";
import { ChangeEmailForm } from "@settings/components/ChangeEmailForm";
import { ChangeNameForm } from "@settings/components/ChangeNameForm";
import { DeleteAccountForm } from "@settings/components/DeleteAccountForm";
import { UserAvatarForm } from "@settings/components/UserAvatarForm";
import { UserLanguageForm } from "@settings/components/UserLanguageForm";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/settings/general/")({
	component: SettingsGeneralPage,
	head: () => ({ meta: [{ title: documentTitle("Settings — General") }] }),
});

function SettingsGeneralPage() {
	const t = useTranslations();

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">{t("settings.menu.account.general")}</h2>
			<SettingsList>
				<UserAvatarForm />
				<ChangeNameForm />
				<ChangeEmailForm />
				<UserLanguageForm />
				<AccountSecurityLink />
				<DeleteAccountForm />
			</SettingsList>
		</div>
	);
}
