import { useAuthErrorMessages } from "@auth/hooks/errors-messages";
import { refreshSession } from "@auth/lib/api";
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
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@repo/ui/components/input-otp";
import { Spinner } from "@repo/ui/components/spinner";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { AlertTriangleIcon, ArrowLeftIcon } from "lucide-react";
import * as z from "zod";

import { getSafeRedirectUrl, invitationUrl, navigateTo } from "../lib/redirects";

const formSchema = z.object({
	code: z.string().min(6).max(6),
});

interface VerifySearch {
	invitationId?: string;
	redirectTo?: string;
}

export function OtpForm() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const search = useSearch({ strict: false }) as VerifySearch;

	const invitationId = search.invitationId;
	const redirectTo = search.redirectTo;

	const redirectUrl = invitationId ? invitationUrl(invitationId) : getSafeRedirectUrl(redirectTo);

	const form = useForm({
		defaultValues: {
			code: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: { code }, formApi }) => {
			try {
				const { error } = await authClient.twoFactor.verifyTotp({ code });
				if (error) {
					throw error;
				}

				await refreshSession(queryClient);
				navigateTo(router, redirectUrl);
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
	const formErrors = useStore(form.store, (s) => s.errors);
	const rootMessage = formatFormRootError(formErrors);

	return (
		<>
			<h1 className="font-bold text-xl md:text-2xl">{t("auth.verify.title")}</h1>
			<p className="mt-1 mb-4 text-foreground/60">{t("auth.verify.message")}</p>

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

					<FormField name="code">
						{(field) => (
							<FormItem>
								<FormLabel>{t("auth.verify.code")}</FormLabel>
								<FormControl>
									<InputOTP
										maxLength={6}
										autoComplete="one-time-code"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(value) => {
											field.handleChange(value);
											if (value.length === 6 && !isSubmitting) {
												void form.handleSubmit();
											}
										}}
									>
										<InputOTPGroup>
											<InputOTPSlot className="size-10 text-lg" index={0} />
											<InputOTPSlot className="size-10 text-lg" index={1} />
											<InputOTPSlot className="size-10 text-lg" index={2} />
										</InputOTPGroup>
										<InputOTPSeparator className="opacity-40" />
										<InputOTPGroup>
											<InputOTPSlot className="size-10 text-lg" index={3} />
											<InputOTPSlot className="size-10 text-lg" index={4} />
											<InputOTPSlot className="size-10 text-lg" index={5} />
										</InputOTPGroup>
									</InputOTP>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					</FormField>

					<Button variant="secondary" type="submit" disabled={isSubmitting}>
						{isSubmitting && <Spinner data-icon="inline-start" />}
						{t("auth.verify.submit")}
					</Button>
				</form>
			</Form>

			<div className="mt-6 text-sm text-center">
				<Link to="/login">
					<ArrowLeftIcon className="mr-1 size-4 inline align-middle" />
					{t("auth.verify.backToSignin")}
				</Link>
			</div>
		</>
	);
}
