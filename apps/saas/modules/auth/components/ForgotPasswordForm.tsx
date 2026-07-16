import { useAuthErrorMessages } from "@auth/hooks/errors-messages";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useForm, useStore } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { AlertTriangleIcon, ArrowLeftIcon, MailboxIcon } from "lucide-react";
import * as z from "zod";

const formSchema = z.object({
	email: z.email(),
});

function firstFormError(errors: unknown[]): string | undefined {
	for (const e of errors) {
		if (typeof e === "string") {
			return e;
		}
		if (e && typeof e === "object") {
			if ("form" in e && typeof (e as { form?: unknown }).form === "string") {
				return (e as { form: string }).form;
			}
			if ("message" in e && typeof (e as { message?: unknown }).message === "string") {
				return (e as { message: string }).message;
			}
		}
	}
	return undefined;
}

export function ForgotPasswordForm() {
	const t = useTranslations();
	const { getAuthErrorMessage } = useAuthErrorMessages();

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: { email }, formApi }) => {
			try {
				const redirectTo = new URL("/reset-password", window.location.origin).toString();

				const { error } = await authClient.requestPasswordReset({
					email,
					redirectTo,
				});

				if (error) {
					throw error;
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
	const rootMessage = firstFormError(formErrors);

	return (
		<>
			<h1 className="font-bold text-xl md:text-2xl text-center">
				{t("auth.forgotPassword.title")}
			</h1>
			<p className="mt-1 mb-6 text-center text-balance text-foreground/60">
				{t("auth.forgotPassword.message")}{" "}
			</p>

			{isSubmitSuccessful ? (
				<Alert variant="success">
					<MailboxIcon />
					<AlertTitle>{t("auth.forgotPassword.hints.linkSent.title")}</AlertTitle>
					<AlertDescription>{t("auth.forgotPassword.hints.linkSent.message")}</AlertDescription>
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
							<Alert variant="error">
								<AlertTriangleIcon />
								<AlertTitle>{rootMessage}</AlertTitle>
							</Alert>
						)}

						<FormField name="email">
							{(field) => (
								<FormItem>
									<FormLabel>{t("auth.forgotPassword.email")}</FormLabel>
									<FormControl>
										<Input
											name={field.name}
											autoComplete="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						</FormField>

						<Button type="submit" variant="primary" loading={isSubmitting}>
							{t("auth.forgotPassword.submit")}
						</Button>
					</form>
				</Form>
			)}

			<div className="mt-6 text-sm text-center">
				<Link to="/login">
					<ArrowLeftIcon className="mr-1 size-4 inline align-middle" />
					{t("auth.forgotPassword.backToSignin")}
				</Link>
			</div>
		</>
	);
}
