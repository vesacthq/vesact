import { ChangeEmailForm } from "@account/components/ChangeEmailForm";
import { ChangeNameForm } from "@account/components/ChangeNameForm";
import { DeleteAccountForm } from "@account/components/DeleteAccountForm";
import { UserAvatarForm } from "@account/components/UserAvatarForm";
import { UserLanguageForm } from "@account/components/UserLanguageForm";
import { useTranslations } from "@i18n/intl";
import { PageHeader } from "@shared/components/PageHeader";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/account/")({
	component: ProfilePage,
	head: () => ({ meta: [{ title: documentTitle("Profile") }] }),
});

function ProfilePage() {
	const t = useTranslations();

	return (
		<div>
			<PageHeader
				title={t("settings.account.profile.title")}
				subtitle={t("settings.account.profile.subtitle")}
			/>
			<SettingsList>
				<UserAvatarForm />
				<ChangeNameForm />
				<ChangeEmailForm />
				<UserLanguageForm />
				<DeleteAccountForm />
			</SettingsList>
		</div>
	);
}
