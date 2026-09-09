import { useSession } from "@auth/hooks/use-session";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { UserAvatarUpload } from "@settings/components/UserAvatarUpload";
import { useForm, useStore } from "@tanstack/react-form";
import { ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

const formSchema = z.object({
	name: z.string(),
});

export function OnboardingAccountStep({ onCompleted }: { onCompleted: () => void }) {
	const t = useTranslations();
	const { user } = useSession();

	const form = useForm({
		defaultValues: {
			name: user?.name ?? "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: { name } }) => {
			await authClient.updateUser({ name });
			onCompleted();
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

	useEffect(() => {
		if (user?.name) {
			form.setFieldValue("name", user.name);
		}
	}, [user?.name]); // oxlint-disable-line eslint-plugin-react-hooks/exhaustive-deps

	return (
		<div>
			<Form form={form}>
				<form
					className="gap-8 flex flex-col items-stretch"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<FormField name="name">
						{(field) => (
							<FormItem>
								<FormLabel>{t("onboarding.account.name")}</FormLabel>
								<FormControl>
									<Input
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</FormControl>
							</FormItem>
						)}
					</FormField>

					<div className="gap-4 flex items-center justify-between">
						<div>
							<p className="font-medium text-sm">{t("onboarding.account.avatar")}</p>
							<FormDescriptionStatic>
								{t("onboarding.account.avatarDescription")}
							</FormDescriptionStatic>
						</div>
						<UserAvatarUpload
							onSuccess={() => {
								return;
							}}
							onError={() => {
								return;
							}}
						/>
					</div>

					<Button variant="secondary" type="submit" disabled={isSubmitting}>
						{isSubmitting && <Spinner data-icon="inline-start" />}
						{t("onboarding.continue")}
						<ArrowRightIcon className="ml-2 size-4" />
					</Button>
				</form>
			</Form>
		</div>
	);
}

// Local static replacement for <FormDescription> since we render the avatar
// upload outside a <FormField> context on this step.
function FormDescriptionStatic({ children }: { children: React.ReactNode }) {
	return <p className="text-sm text-foreground/60">{children}</p>;
}
