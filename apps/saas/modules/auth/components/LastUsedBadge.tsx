import { useTranslations } from "@i18n/intl";

import { useLastUsedLoginMethod } from "../hooks/use-last-used-login-method";
import { isLastUsedLoginMethod } from "../lib/last-used-login-method";

export function LastUsedBadge({ method }: { method: string }) {
	const t = useTranslations();
	const lastUsedLoginMethod = useLastUsedLoginMethod();

	if (!isLastUsedLoginMethod(lastUsedLoginMethod, method)) {
		return null;
	}

	return (
		<span className="ml-1.5 px-1.5 py-0.5 font-medium rounded-md bg-primary/10 text-[10px] leading-none text-primary">
			{t("auth.login.lastUsed")}
		</span>
	);
}
