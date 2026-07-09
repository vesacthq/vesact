import { useSession } from "@auth/hooks/use-session";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useMutation } from "@tanstack/react-query";

import { UserAvatarUpload } from "./UserAvatarUpload";

export function UserAvatarForm() {
	const t = useTranslations();
	const { reloadSession } = useSession();
	const deleteAvatarMutation = useMutation({
		mutationFn: async () => {
			const { error } = await authClient.updateUser({
				image: "",
			});

			if (error) {
				throw error;
			}
		},
		onSuccess: async () => {
			await reloadSession();
			toastSuccess(t("settings.account.avatar.notifications.success"));
		},
		onError: () => {
			toastError(t("settings.account.avatar.notifications.error"));
		},
	});

	return (
		<SettingsItem
			title={t("settings.account.avatar.title")}
			description={t("settings.account.avatar.description")}
		>
			<UserAvatarUpload
				onSuccess={() => {
					toastSuccess(t("settings.account.avatar.notifications.success"));
				}}
				onError={() => {
					toastError(t("settings.account.avatar.notifications.error"));
				}}
				onDelete={() => deleteAvatarMutation.mutate()}
				isDeleting={deleteAvatarMutation.isPending}
				deleteLabel={t("settings.account.avatar.delete")}
			/>
		</SettingsItem>
	);
}
