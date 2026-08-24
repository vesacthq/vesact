import { useTranslations } from "@i18n/intl";
import { cn } from "@repo/ui";

import { useLastUsedLoginMethod } from "../hooks/use-last-used-login-method";
import { isLastUsedLoginMethod } from "../lib/last-used-login-method";

export function LastUsedBadge({
	method,
	placement = "inline",
}: {
	method: string;
	placement?: "inline" | "corner";
}) {
	const t = useTranslations();
	const lastUsedLoginMethod = useLastUsedLoginMethod();

	if (!isLastUsedLoginMethod(lastUsedLoginMethod, method)) {
		return null;
	}

	return (
		<span
			className={cn(
				"px-1.5 py-0.5 font-medium rounded-md bg-touch text-[10px] leading-none text-touch-foreground",
				placement === "corner"
					? "top-0 right-3 pointer-events-none absolute -translate-y-1/2"
					: "ml-1.5",
			)}
		>
			{t("auth.login.lastUsed")}
		</span>
	);
}
