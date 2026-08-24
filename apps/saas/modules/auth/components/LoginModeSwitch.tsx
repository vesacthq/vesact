import { useTranslations } from "@i18n/intl";
import { cn } from "@repo/ui";

import { lastUsedLoginMethodIds } from "../lib/last-used-login-method";
import { LastUsedBadge } from "./LastUsedBadge";

export function LoginModeSwitch({
	activeMode,
	onChange,
	className,
}: {
	activeMode: "password" | "magic-link";
	onChange: (mode: string) => void;
	className?: string;
}) {
	const t = useTranslations();
	return (
		<div
			role="tablist"
			aria-label="Login mode"
			className={cn(
				"text-sm inline-flex w-full items-center justify-center border-b-2 text-card-foreground/80",
				className,
			)}
		>
			<button
				type="button"
				role="tab"
				aria-selected={activeMode === "password"}
				aria-controls="login-password-panel"
				id="login-password-tab"
				onClick={() => onChange("password")}
				className={cn(
					"-mb-0.5 px-3 py-2 font-medium flex-1 border-b-2 border-transparent whitespace-nowrap text-foreground/60 transition-all hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden",
					activeMode === "password" && "border-primary text-card-foreground",
				)}
			>
				{t("auth.login.modes.password")}
				<LastUsedBadge method={lastUsedLoginMethodIds.password} />
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={activeMode === "magic-link"}
				aria-controls="login-magic-link-panel"
				id="login-magic-link-tab"
				onClick={() => onChange("magic-link")}
				className={cn(
					"-mb-0.5 px-3 py-2 font-medium flex-1 border-b-2 border-transparent whitespace-nowrap text-foreground/60 transition-all hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden",
					activeMode === "magic-link" && "border-primary text-card-foreground",
				)}
			>
				{t("auth.login.modes.magicLink")}
				<LastUsedBadge method={lastUsedLoginMethodIds.magicLink} />
			</button>
		</div>
	);
}
