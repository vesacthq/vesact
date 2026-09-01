import { useSession } from "@auth/hooks/use-session";
import { useTranslations } from "@i18n/intl";
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

export function ChangeNameForm() {
	const { user, reloadSession } = useSession();
	const t = useTranslations();

	const form = useForm({
		defaultValues: {
			name: user?.name ?? "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value: { name }, formApi }) => {
			const { error } = await authClient.updateUser({ name });

			if (error) {
				toast.add({ title: t("settings.account.changeName.notifications.error"), type: "error" });
				return;
			}

			await reloadSession();
			toast.add({ title: t("settings.account.changeName.notifications.success"), type: "success" });

			// Reset the baseline so `isDirty` flips back to false until the next edit.
			formApi.reset({ name });
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const canSubmit = useStore(form.store, (s) => s.canSubmit && s.isDirty);

	return (
		<SettingsItem title={t("settings.account.changeName.title")}>
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
							type="text"
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
