import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { toast } from "@repo/ui/components/toast";
import { passwordSchema } from "@repo/utils";
import { PasswordInput } from "@shared/components/PasswordInput";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";

const formSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: passwordSchema,
});

export function ChangePasswordForm() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			const { error } = await authClient.changePassword({
				...value,
				revokeOtherSessions: true,
			});

			if (error) {
				toast.add({
					title: t("settings.account.security.changePassword.notifications.error"),
					type: "error",
				});
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: ["active-sessions"],
			});

			toast.add({
				title: t("settings.account.security.changePassword.notifications.success"),
				type: "success",
			});
			formApi.reset({ currentPassword: "", newPassword: "" });
			void router.invalidate();
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const canSubmit = useStore(form.store, (s) => s.canSubmit && s.isDirty);

	return (
		<SettingsItem title={t("settings.account.security.changePassword.title")}>
			<Form form={form}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<div className="gap-4 grid grid-cols-1">
						<FormField name="currentPassword">
							{(field) => (
								<FormItem>
									<FormLabel>
										{t("settings.account.security.changePassword.currentPassword")}
									</FormLabel>
									<FormControl>
										<PasswordInput
											name={field.name}
											autoComplete="current-password"
											value={field.state.value}
											onChange={(next) => field.handleChange(next)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						</FormField>

						<FormField name="newPassword">
							{(field) => (
								<FormItem>
									<FormLabel>{t("settings.account.security.changePassword.newPassword")}</FormLabel>
									<FormControl>
										<PasswordInput
											name={field.name}
											autoComplete="new-password"
											showPasswordCriteria
											showGenerateButton
											value={field.state.value}
											onChange={(next) => field.handleChange(next)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						</FormField>

						<div className="flex justify-end">
							<Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
								{t("settings.save")}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</SettingsItem>
	);
}
