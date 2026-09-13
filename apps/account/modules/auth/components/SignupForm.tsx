import { useAuthErrorMessages } from "@auth/hooks/errors-messages";
import { useSession } from "@auth/hooks/use-session";
import { completeSignIn } from "@auth/lib/api";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { config as authConfig } from "@repo/auth/config";
import { cn } from "@repo/ui";
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
import { formatFormRootError } from "@repo/ui/components/form-root-error";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { passwordSchema } from "@repo/utils";
import { PasswordInput } from "@shared/components/PasswordInput";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { AlertTriangleIcon, ArrowRightIcon, MailboxIcon } from "lucide-react";
import { useEffect } from "react";
import { withQuery } from "ufo";
import { z } from "zod";

import type { OAuthProvider } from "../constants/oauth-providers";
import { browserHref, getSafeRedirectUrl, invitationUrl, navigateTo } from "../lib/redirects";
import { InvitationAlert } from "./InvitationAlert";
import { SocialSigninButton } from "./SocialSigninButton";

const formSchema = z.object({
	email: z.email(),
	name: z.string().min(1),
	password: authConfig.enablePasswordLogin ? passwordSchema : z.string(),
});

interface AuthSearch extends Record<string, string | undefined> {
	email?: string;
	invitationId?: string;
	redirectTo?: string;
}

export function SignupForm({
	prefillEmail,
	oAuthProviders,
}: {
	prefillEmail?: string;
	oAuthProviders: OAuthProvider[];
}) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user, loaded: sessionLoaded } = useSession();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const search = useSearch({ strict: false }) as AuthSearch;

	const invitationId = search.invitationId;
	const email = search.email;
	const redirectTo = search.redirectTo;

	const invitationOnlyMode = !authConfig.enableSignup && invitationId;
	const redirectUrl = invitationId ? invitationUrl(invitationId) : getSafeRedirectUrl(redirectTo);

	const form = useForm({
		defaultValues: {
			name: "",
			email: prefillEmail ?? email ?? "",
			password: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: { email: emailValue, password, name }, formApi }) => {
			try {
				const { error } = await (authConfig.enablePasswordLogin
					? await authClient.signUp.email({
							email: emailValue,
							password,
							name,
							callbackURL: browserHref(redirectUrl),
						})
					: authClient.signIn.magicLink({
							email: emailValue,
							name,
							callbackURL: browserHref(redirectUrl),
						}));

				if (error) {
					throw error;
				}

				if (invitationOnlyMode) {
					const { error: acceptError } = await authClient.organization.acceptInvitation({
						invitationId,
					});

					if (acceptError) {
						throw acceptError;
					}

					await completeSignIn(queryClient, router, redirectUrl);
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

	useEffect(() => {
		if (sessionLoaded && user) {
			navigateTo(router, redirectUrl);
		}
	}, [user, sessionLoaded, router, redirectUrl]);

	return (
		<div>
			<h1 className="font-bold text-xl md:text-2xl text-center">{t("auth.signup.title")}</h1>
			<p className="mt-1 mb-6 text-center text-balance text-foreground/60">
				{t("auth.signup.message")}
			</p>

			{isSubmitSuccessful && !invitationOnlyMode ? (
				<Alert variant="success">
					<MailboxIcon />
					<AlertTitle>{t("auth.signup.hints.verifyEmail")}</AlertTitle>
				</Alert>
			) : (
				<>
					{invitationId && <InvitationAlert className="mb-6" />}

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
									<AlertDescription>{rootMessage}</AlertDescription>
								</Alert>
							)}

							<FormField name="name">
								{(field) => (
									<FormItem>
										<FormLabel>{t("auth.signup.name")}</FormLabel>
										<FormControl>
											<Input
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							</FormField>

							<FormField name="email">
								{(field) => (
									<FormItem>
										<FormLabel>{t("auth.signup.email")}</FormLabel>
										<FormControl>
											<Input
												name={field.name}
												autoComplete="email"
												readOnly={!!prefillEmail}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							</FormField>

							{authConfig.enablePasswordLogin && (
								<FormField name="password">
									{(field) => (
										<FormItem>
											<FormLabel>{t("auth.signup.password")}</FormLabel>
											<FormControl>
												<PasswordInput
													name={field.name}
													autoComplete="new-password"
													showGenerateButton
													showPasswordCriteria
													value={field.state.value}
													onChange={(next) => field.handleChange(next)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								</FormField>
							)}

							<Button type="submit" variant="default" disabled={isSubmitting}>
								{isSubmitting && <Spinner data-icon="inline-start" />}
								{t("auth.signup.submit")}
							</Button>
						</form>
					</Form>

					{authConfig.enableSignup && authConfig.enableSocialLogin && oAuthProviders.length > 0 && (
						<>
							<div className="my-6 h-4 relative">
								<hr className="top-2 relative" />
								<p className="top-0 h-4 px-2 font-medium text-sm leading-tight absolute left-1/2 mx-auto inline-block -translate-x-1/2 bg-background text-center text-foreground/60">
									{t("auth.login.continueWith")}
								</p>
							</div>

							<div
								className={cn(
									"gap-2 grid grid-cols-1 items-stretch",
									oAuthProviders.length > 1 && "sm:grid-cols-2",
								)}
							>
								{oAuthProviders.map((provider) => (
									<SocialSigninButton key={provider} provider={provider} />
								))}
							</div>
						</>
					)}
				</>
			)}

			<div className="mt-6 text-sm text-center">
				<span className="text-foreground/60">{t("auth.signup.alreadyHaveAccount")} </span>
				<Link to={withQuery("/login", search)}>
					{t("auth.signup.signIn")}
					<ArrowRightIcon className="ml-1 size-4 inline align-middle" />
				</Link>
			</div>
		</div>
	);
}
