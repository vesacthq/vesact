import { useTranslations } from "@i18n/intl";
import { useOrganization } from "@organizations/hooks/use-organization";
import { organizationListQueryKey } from "@organizations/lib/api";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/components/toast";
import { useConfirmationAlert } from "@shared/components/ConfirmationAlertProvider";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function DeleteOrganizationForm() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();
	const { organization } = useOrganization();

	const handleDelete = () => {
		confirm({
			title: t("organizations.settings.deleteOrganization.title"),
			message: t("organizations.settings.deleteOrganization.confirmation"),
			destructive: true,
			onConfirm: async () => {
				const { error } = await authClient.organization.delete({
					organizationId: organization.id,
				});

				if (error) {
					toast.add({
						title: t("organizations.settings.notifications.organizationNotDeleted"),
						type: "error",
					});
					return;
				}

				toast.add({
					title: t("organizations.settings.notifications.organizationDeleted"),
					type: "success",
				});
				await queryClient.invalidateQueries({ queryKey: organizationListQueryKey });
				void router.navigate({ to: "/orgs", search: true, replace: true });
			},
		});
	};

	return (
		<SettingsItem
			danger
			title={t("organizations.settings.deleteOrganization.title")}
			description={t("organizations.settings.deleteOrganization.description")}
		>
			<div className="mt-4 flex justify-end">
				<Button variant="destructive" onClick={handleDelete}>
					{t("organizations.settings.deleteOrganization.submit")}
				</Button>
			</div>
		</SettingsItem>
	);
}
