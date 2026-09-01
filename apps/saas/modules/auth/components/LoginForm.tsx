import { useAuthErrorMessages } from "@auth/hooks/errors-messages";
import { sessionQueryKey } from "@auth/lib/api";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { OrganizationInvitationAlert } from "@organizations/components/OrganizationInvitationAlert";
import { authClient } from "@repo/auth/client";
import { config as authConfig } from "@repo/auth/config";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { formatFormRootError } from "@repo/ui/components/form-root-error";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import {
	AlertTriangleIcon,
	ArrowRightIcon,
	EyeIcon,
	EyeOffIcon,
	KeyIcon,
	MailboxIcon,
} from "lucide-react";
import { useState } from "react";
import { withQuery } from "ufo";
import { z } from "zod";

import { type OAuthProvider, oAuthProviders } from "../constants/oauth-providers";
import { lastUsedLoginMethodIds } from "../lib/last-used-login-method";
import { getSafeRedirectPath } from "../lib/redirects";
import { LastUsedBadge } from "./LastUsedBadge";
import { LoginModeSwitch } from "./LoginModeSwitch";
import { SocialSigninButton } from "./SocialSigninButton";

const formSchema = z.object({
	email: z.email(),
	password: z.string(),
});

interface AuthSearch extends Record<string, string | undefined> {
	email?: string;
	invitationId?: string;
	redirectTo?: string;
}

export function LoginForm() {
	const t = useTranslations();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const router = useRouter();
	const queryClient = useQueryClient();
	const search = useSearch({ strict: false }) as AuthSearch;

	const [showPassword, setShowPassword] = useState(false);
	const [signinMode, setSigninMode] = useState<"password" | "magic-link">(
		authConfig.enablePasswordLogin ? "password" : "magic-link",
	);
	const [magicLinkSent, setMagicLinkSent] = useState(false);
	const invitationId = search.invitationId;
	const email = search.email;
	const redirectTo = search.redirectTo;

	const redirectPath = invitationId
		? `/organization-invitation/${invitationId}`
		: getSafeRedirectPath(redirectTo, config.redirectAfterSignIn);

	const form = useForm({
		defaultValues: {
			email: email ?? "",
			password: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: values, formApi }) => {
			try {
				setMagicLinkSent(false);

				if (signinMode === "password") {
					if (!values.password) {
						formApi.setFieldMeta("password", (prev) => ({
							...prev,
							errors: [t("auth.signup.password")],
							errorMap: { ...prev.errorMap, onSubmit: t("auth.signup.password") },
						}));
						return;
					}

					const { data, error } = await authClient.signIn.email({
						email: values.email,
						password: values.password,
					});

					if (error) {
						throw error;
					}

					if ((data as { twoFactorRedirect?: boolean }).twoFactorRedirect) {
						void router.navigate({
							to: withQuery("/verify", search),
							replace: true,
						});
						return;
					}

					await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
					void router.navigate({ to: redirectPath, replace: true });
				} else {
					const { error } = await authClient.signIn.magicLink({
						email: values.email,
						callbackURL: redirectPath,
					});

					if (error) {
						throw error;
					}

					setMagicLinkSent(true);
				}
			} catch (e) {
				setMagicLinkSent(false);
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

	const signInWithPasskey = async () => {
		try {
			await authClient.signIn.passkey();
			void router.navigate({ to: redirectPath, replace: true });
		} catch (e) {
			form.setErrorMap({
				onSubmit: {
					form: getAuthErrorMessage(
						e && typeof e === "object" && "code" in e ? (e.code as string) : undefined,
					),
					fields: {},
				},
			});
		}
	};

	return (
		<div>
			<h1 className="font-bold text-xl md:text-2xl text-center">{t("auth.login.title")}</h1>
			<p className="mt-1 mb-6 text-center text-foreground/60">{t("auth.login.subtitle")}</p>

			{magicLinkSent ? (
				<Alert variant="success">
					<MailboxIcon />
					<AlertTitle>{t("auth.login.hints.linkSent.title")}</AlertTitle>
					<AlertDescription>{t("auth.login.hints.linkSent.message")}</AlertDescription>
				</Alert>
			) : (
				<>
					{invitationId && <OrganizationInvitationAlert className="mb-6" />}

					<Form form={form}>
						<form
							className="space-y-4"
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
						>
							{authConfig.enableMagicLink && authConfig.enablePasswordLogin && (
								<LoginModeSwitch
									activeMode={signinMode}
									onChange={(mode) => {
										setMagicLinkSent(false);
										setSigninMode(mode as typeof signinMode);
									}}
								/>
							)}

							{rootMessage && (
								<Alert variant="destructive">
									<AlertTriangleIcon />
									<AlertTitle>{rootMessage}</AlertTitle>
								</Alert>
							)}

							<FormField name="email">
								{(field) => (
									<FormItem>
										<FormLabel>{t("auth.signup.email")}</FormLabel>
										<FormControl>
											<Input
												name={field.name}
												autoComplete="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</FormControl>
									</FormItem>
								)}
							</FormField>

							{authConfig.enablePasswordLogin && signinMode === "password" && (
								<FormField name="password">
									{(field) => (
										<FormItem className="relative">
											<FormLabel>{t("auth.signup.password")}</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														name={field.name}
														type={showPassword ? "text" : "password"}
														className="pr-10"
														autoComplete="current-password"
														value={field.state.value ?? ""}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="inset-y-0 right-0 pr-4 text-xl absolute flex items-center text-primary"
													>
														{showPassword ? (
															<EyeOffIcon className="size-4" />
														) : (
															<EyeIcon className="size-4" />
														)}
													</button>
												</div>
											</FormControl>
											<Link
												to="/forgot-password"
												className="top-0 right-0 text-xs absolute text-foreground/60"
											>
												{t("auth.login.forgotPassword")}
											</Link>
										</FormItem>
									)}
								</FormField>
							)}

							<Button className="w-full" type="submit" variant="default" disabled={isSubmitting}>
								{isSubmitting && <Spinner data-icon="inline-start" />}
								{signinMode === "magic-link"
									? t("auth.login.sendMagicLink")
									: t("auth.login.submit")}
								{!(authConfig.enableMagicLink && authConfig.enablePasswordLogin) && (
									<LastUsedBadge
										method={
											signinMode === "magic-link"
												? lastUsedLoginMethodIds.magicLink
												: lastUsedLoginMethodIds.password
										}
									/>
								)}
							</Button>
						</form>
					</Form>

					{(authConfig.enablePasskeys ||
						(authConfig.enableSignup && authConfig.enableSocialLogin)) && (
						<>
							<div className="my-6 h-4 relative">
								<hr className="top-2 relative" />
								<p className="top-0 h-4 px-2 font-medium text-sm leading-tight absolute left-1/2 mx-auto inline-block -translate-x-1/2 bg-background text-center text-foreground/60">
									{t("auth.login.continueWith")}
								</p>
							</div>

							<div className="gap-2 sm:grid-cols-2 grid grid-cols-1 items-stretch">
								{authConfig.enableSignup &&
									authConfig.enableSocialLogin &&
									Object.keys(oAuthProviders).map((providerId) => (
										<SocialSigninButton key={providerId} provider={providerId as OAuthProvider} />
									))}

								{authConfig.enablePasskeys && (
									<Button
										variant="secondary"
										className="sm:col-span-2 relative w-full overflow-visible"
										onClick={() => signInWithPasskey()}
									>
										<KeyIcon className="mr-1.5 size-4 text-primary" />
										{t("auth.login.loginWithPasskey")}
										<LastUsedBadge method={lastUsedLoginMethodIds.passkey} placement="corner" />
									</Button>
								)}
							</div>
						</>
					)}

					{authConfig.enableSignup && (
						<div className="mt-6 text-sm text-center">
							<span className="text-foreground/60">{t("auth.login.dontHaveAnAccount")} </span>
							<Link to={withQuery("/signup", search)}>
								{t("auth.login.createAnAccount")}
								<ArrowRightIcon className="ml-1 size-4 inline align-middle" />
							</Link>
						</div>
					)}
				</>
			)}
		</div>
	);
}
