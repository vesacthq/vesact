import { useLocalePathname, useLocaleRouter } from "@i18n/routing";
import { config as i18nConfig } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { LocaleSwitch as LocaleSwitchControl } from "@repo/ui";
import { useTranslations } from "use-intl";

const locales = Object.entries(i18nConfig.locales).map(([value, localeConfig]) => ({
	value,
	label: localeConfig.label,
}));

export function LocaleSwitch() {
	const t = useTranslations();
	const localeRouter = useLocaleRouter();
	const localePathname = useLocalePathname();
	const currentLocale = getCurrentLocale();

	return (
		<LocaleSwitchControl
			locales={locales}
			value={currentLocale}
			label={t("common.aria.language")}
			onValueChange={(nextLocale) => {
				const search = typeof window !== "undefined" ? window.location.search : "";
				localeRouter.replace(`${localePathname}${search}`, {
					locale: nextLocale,
				});
			}}
		/>
	);
}
