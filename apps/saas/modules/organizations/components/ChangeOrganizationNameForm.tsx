import { useTranslations } from "@i18n/intl";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { organizationListQueryKey } from "@organizations/lib/api";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3),
});

export function ChangeOrganizationNameForm() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { activeOrganization, refetchActiveOrganization } = useActiveOrganization();

	const form = useForm({
		defaultValues: {
			name: activeOrganization?.name ?? "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value: { name }, formApi }) => {
			if (!activeOrganization) {
				return;
			}

			try {
				const { error } = await authClient.organization.update({
					organizationId: activeOrganization.id,
					data: { name },
				});

				if (error) {
					throw error;
				}

				await queryClient.invalidateQueries({ queryKey: organizationListQueryKey });
				await refetchActiveOrganization();
				void router.invalidate();

				toast.add({
					title: t("organizations.settings.changeName.notifications.success"),
					type: "success",
				});

				formApi.reset({ name });
			} catch {
				toast.add({
					title: t("organizations.settings.changeName.notifications.error"),
					type: "error",
				});
			}
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const canSubmit = useStore(form.store, (s) => s.canSubmit && s.isDirty);

	return (
		<SettingsItem title={t("organizations.settings.changeName.title")}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field name="name">
					{(field) => (
						<Input
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					)}
				</form.Field>

				<div className="mt-4 flex justify-end">
					<Button variant="secondary" type="submit" disabled={!canSubmit || isSubmitting}>
						{isSubmitting && <Spinner data-icon="inline-start" />}
						{t("settings.save")}
					</Button>
				</div>
			</form>
		</SettingsItem>
	);
}
