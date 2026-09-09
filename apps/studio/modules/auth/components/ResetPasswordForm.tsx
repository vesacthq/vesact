import { useAuthErrorMessages } from "@auth/hooks/errors-messages";
import { useSession } from "@auth/hooks/use-session";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { Alert, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { formatFormRootError } from "@repo/ui/components/form-root-error";
import { Spinner } from "@repo/ui/components/spinner";
import { passwordSchema } from "@repo/utils";
import { PasswordInput } from "@shared/components/PasswordInput";
import { useForm, useStore } from "@tanstack/react-form";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { AlertTriangleIcon, ArrowLeftIcon, MailboxIcon } from "lucide-react";
import * as z from "zod";

const formSchema = z.object({
	password: passwordSchema,
});

interface ResetPasswordSearch {
	token?: string;
}

export function ResetPasswordForm() {
	const t = useTranslations();
	const { user } = useSession();
	const router = useRouter();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const search = useSearch({ strict: false }) as ResetPasswordSearch;
	const token = search.token;

	const form = useForm({
		defaultValues: {
			password: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: { password }, formApi }) => {
			try {
				const { error } = await authClient.resetPassword({
					token: token ?? undefined,
					newPassword: password,
				});

				if (error) {
					throw error;
				}

				if (user) {
					void router.navigate({ to: config.redirectAfterSignIn });
				}
			} catch (e) {
				formApi.setErrorMap({
					onSubmit: {
						form: getAuthErrorMessage(
							e && typeof e === "object" && "code" in e ? (e.code as string) : undefined,
						),
						fields: {},
					},
				});
			}
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const isSubmitSuccessful = useStore(form.store, (s) => s.isSubmitSuccessful);
	const formErrors = useStore(form.store, (s) => s.errors);
	const rootMessage = formatFormRootError(formErrors);

	return (
		<>
			<h1 className="font-bold text-xl md:text-2xl text-center">{t("auth.resetPassword.title")}</h1>
			<p className="mt-1 mb-6 text-center text-balance text-foreground/60">
				{t("auth.resetPassword.message")}{" "}
			</p>

			{isSubmitSuccessful ? (
				<Alert variant="success">
					<MailboxIcon />
					<AlertTitle>{t("auth.resetPassword.hints.success")}</AlertTitle>
				</Alert>
			) : (
				<Form form={form}>
					<form
						className="gap-4 flex flex-col items-stretch"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
					>
						{rootMessage && (
							<Alert variant="destructive">
								<AlertTriangleIcon />
								<AlertTitle>{rootMessage}</AlertTitle>
							</Alert>
						)}

						<FormField name="password">
							{(field) => (
								<FormItem>
									<FormLabel>{t("auth.resetPassword.newPassword")}</FormLabel>
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

						<Button variant="secondary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <Spinner data-icon="inline-start" />}
							{t("auth.resetPassword.submit")}
						</Button>
					</form>
				</Form>
			)}

			<div className="mt-6 text-sm text-center">
				<Link to="/login">
					<ArrowLeftIcon className="mr-1 size-4 inline align-middle" />
					{t("auth.resetPassword.backToSignin")}
				</Link>
			</div>
		</>
	);
}
