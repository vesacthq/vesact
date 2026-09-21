import { getMessagesForLocaleSync, type VesactWwwMessages } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { useRouterState } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { IntlProvider } from "use-intl";

export function I18nProvider({ children }: PropsWithChildren) {
	useRouterState({ select: (s) => s.location.pathname });

	const locale = getCurrentLocale();
	const messages = getMessagesForLocaleSync<VesactWwwMessages>(locale, "vesact-www");

	return (
		<IntlProvider locale={locale} messages={messages} timeZone="UTC">
			{children}
		</IntlProvider>
	);
}
