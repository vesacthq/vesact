import { useSession } from "@auth/hooks/use-session";
import { getReturnUrl, productNameForUrl } from "@auth/lib/redirects";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { ColorModeToggle, Logo } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { useSearch } from "@tanstack/react-router";
import { ArrowLeftIcon, LogOutIcon } from "lucide-react";

/**
 * Products link here with `from=<their current page>`; the back button returns
 * there and names the product, so the account center reads as one more
 * settings page of whatever the user was using.
 */
export function AccountHeader() {
	const t = useTranslations();
	const { user } = useSession();
	const { from } = useSearch({ strict: false }) as { from?: string };
	const returnUrl = getReturnUrl(from);

	const onLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = new URL("/login", window.location.origin).toString();
				},
			},
		});
	};

	return (
		<div className="container">
			<div className="gap-4 flex flex-wrap items-center justify-between">
				<div className="gap-4 flex items-center">
					<a href={config.marketingUrl ?? "/"} className="block">
						<Logo withLabel={false} />
					</a>
					{returnUrl !== "/" && (
						<Button
							variant="ghost"
							nativeButton={false}
							render={(props) => (
								<a {...props} href={returnUrl}>
									<ArrowLeftIcon aria-hidden="true" />
									{t("account.back", { product: productNameForUrl(returnUrl) })}
								</a>
							)}
						/>
					)}
				</div>

				<div className="gap-2 flex items-center justify-end">
					{user && <span className="text-sm text-foreground/60">{user.email}</span>}
					<LocaleSwitch />
					<ColorModeToggle
						modes={["system", "light", "dark"]}
						labels={{
							system: t("common.colorMode.system"),
							light: t("common.colorMode.light"),
							dark: t("common.colorMode.dark"),
						}}
					/>
					<Button variant="secondary" onClick={onLogout}>
						<LogOutIcon aria-hidden="true" />
						{t("account.logout")}
					</Button>
				</div>
			</div>
		</div>
	);
}
