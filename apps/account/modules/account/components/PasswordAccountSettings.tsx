import { useUserAccountsQuery } from "@auth/lib/api";
import { useTranslations } from "@i18n/intl";
import { Skeleton } from "@repo/ui/components/skeleton";
import { SettingsItem } from "@shared/components/SettingsItem";

import { ChangePasswordForm } from "./ChangePassword";
import { SetPasswordForm } from "./SetPassword";

export function PasswordAccountSettings() {
	const t = useTranslations();
	const { data: accounts, isPending } = useUserAccountsQuery();

	const hasCredentialAccount = accounts?.some((account) => account.providerId === "credential");

	if (isPending) {
		return (
			<SettingsItem title={t("settings.account.security.changePassword.title")}>
				<Skeleton className="h-32 max-w-md w-full" />
			</SettingsItem>
		);
	}

	if (hasCredentialAccount) {
		return <ChangePasswordForm />;
	}

	return <SetPasswordForm />;
}
