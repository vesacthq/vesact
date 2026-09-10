import { useTranslations } from "@i18n/intl";
import { useOrganization } from "@organizations/hooks/use-organization";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3),
});

export function ChangeOrganizationNameForm({ disabled }: { disabled?: boolean }) {
	const t = useTranslations();
	const { organization, refetch } = useOrganization();

	const form = useForm({
		defaultValues: {
			name: organization.name,
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value: { name }, formApi }) => {
			try {
				const { error } = await authClient.organization.update({
					organizationId: organization.id,
					data: { name },
				});

				if (error) {
					throw error;
				}

				await refetch();

				toast.add({
					title: t("organizations.settings.notifications.organizationNameUpdated"),
					type: "success",
				});

				formApi.reset({ name });
			} catch {
				toast.add({
					title: t("organizations.settings.notifications.organizationNameNotUpdated"),
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
							disabled={disabled}
						/>
					)}
				</form.Field>

				{!disabled && (
					<div className="mt-4 flex justify-end">
						<Button variant="secondary" type="submit" disabled={!canSubmit || isSubmitting}>
							{isSubmitting && <Spinner data-icon="inline-start" />}
							{t("settings.save")}
						</Button>
					</div>
				)}
			</form>
		</SettingsItem>
	);
}
