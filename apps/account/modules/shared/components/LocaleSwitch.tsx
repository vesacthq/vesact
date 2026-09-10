import { useTranslations } from "@i18n/intl";
import { setLocaleCookie } from "@i18n/lib/update-locale";
import { useLocalePathname, useLocaleRouter } from "@i18n/routing";
import type { Locale } from "@repo/i18n";
import { config as i18nConfig } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { LocaleSwitch as LocaleSwitchControl } from "@repo/ui";
import { useIsClient } from "usehooks-ts";

function isLocale(value: string): value is Locale {
	return Object.hasOwn(i18nConfig.locales, value);
}

const locales = Object.entries(i18nConfig.locales).map(([value, localeConfig]) => ({
	value,
	label: localeConfig.label,
}));

export function LocaleSwitch() {
	const t = useTranslations();
	const localeRouter = useLocaleRouter();
	const localePathname = useLocalePathname();
	const currentLocale = getCurrentLocale();
	const isClient = useIsClient();

	if (!isClient) {
		return null;
	}

	return (
		<LocaleSwitchControl
			locales={locales}
			value={currentLocale}
			label={t("common.aria.language")}
			onValueChange={(nextLocale) => {
				if (!isLocale(nextLocale)) {
					return;
				}

				setLocaleCookie(nextLocale);
				const search = typeof window !== "undefined" ? window.location.search : "";
				localeRouter.replace(`${localePathname}${search}`, {
					locale: nextLocale,
				});
			}}
		/>
	);
}
