import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/relay/auth/client";
import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/components/toast";

import { oAuthProviders } from "../constants/oauth-providers";

export function GoogleSigninButton({ callbackURL }: { callbackURL: string }) {
	const t = useTranslations();
	const provider = oAuthProviders.google;

	const onSignin = async () => {
		const { error } = await authClient.signIn.social({ provider: "google", callbackURL });

		if (error) {
			toast.add({ title: t("auth.login.failed"), type: "error" });
		}
	};

	return (
		<Button variant="secondary" type="button" className="w-full" onClick={() => onSignin()}>
			<provider.icon className="size-4 mr-2 text-primary" />
			{t("auth.login.continueWith", { provider: provider.name })}
		</Button>
	);
}
