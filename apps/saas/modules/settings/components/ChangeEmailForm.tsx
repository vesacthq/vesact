import { useSession } from "@auth/hooks/use-session";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";

const formSchema = z.object({
	email: z.email(),
});

export function ChangeEmailForm() {
	const { user, reloadSession } = useSession();
	const t = useTranslations();

	const form = useForm({
		defaultValues: {
			email: user?.email ?? "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value: { email } }) => {
			const { error } = await authClient.changeEmail({ newEmail: email });

			if (error) {
				toast.add({ title: t("settings.account.changeEmail.notifications.error"), type: "error" });
				return;
			}

			await reloadSession();
			toast.add({
				title: t("settings.account.changeEmail.notifications.success"),
				type: "success",
			});
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const canSubmit = useStore(form.store, (s) => s.canSubmit && s.isDirty);

	return (
		<SettingsItem
			title={t("settings.account.changeEmail.title")}
			description={t("settings.account.changeEmail.description")}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field name="email">
					{(field) => (
						<Input
							type="email"
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					)}
				</form.Field>

				<div className="mt-4 flex justify-end">
					<Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
						{t("settings.save")}
					</Button>
				</div>
			</form>
		</SettingsItem>
	);
}
