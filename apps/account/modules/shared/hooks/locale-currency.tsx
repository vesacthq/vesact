import { config as i18nConfig } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { useRouterState } from "@tanstack/react-router";

export function useLocaleCurrency() {
	useRouterState({ select: (s) => s.location.pathname });
	const locale = getCurrentLocale();
	const localeCurrency =
		Object.entries(i18nConfig.locales).find(([key]) => key === locale)?.[1].currency ??
		i18nConfig.defaultCurrency;

	return localeCurrency;
}
