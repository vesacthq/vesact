import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/components/toast";
import { useSearch } from "@tanstack/react-router";

import { oAuthProviders } from "../constants/oauth-providers";
import { browserHref, getSafeRedirectUrl, invitationUrl } from "../lib/redirects";
import { LastUsedBadge } from "./LastUsedBadge";

export function SocialSigninButton({
	provider,
	className,
}: {
	provider: keyof typeof oAuthProviders;
	className?: string;
}) {
	const t = useTranslations();
	const search = useSearch({ strict: false }) as { invitationId?: string; redirectTo?: string };
	const providerData = oAuthProviders[provider];

	// Better Auth redirects to it as the browser would, so an app path needs the mount path.
	const callbackURL = browserHref(
		search.invitationId
			? invitationUrl(search.invitationId)
			: getSafeRedirectUrl(search.redirectTo),
	);

	const onSignin = async () => {
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL,
		});

		if (error) {
			toast.add({ title: t("auth.login.hints.socialSigninFailed"), type: "error" });
		}
	};

	return (
		<Button
			variant="secondary"
			onClick={() => onSignin()}
			type="button"
			className={cn("relative overflow-visible", className)}
		>
			{providerData.icon && (
				<i className="mr-2 text-primary">
					<providerData.icon className="size-4" />
				</i>
			)}
			{providerData.name}
			<LastUsedBadge method={provider} placement="corner" />
		</Button>
	);
}
