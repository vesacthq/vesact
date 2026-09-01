import type { I18nConfig } from "./types";

export const config = {
	locales: {
		en: {
			label: "English",
			currency: "USD",
		},
		de: {
			label: "Deutsch",
			currency: "USD",
		},
		es: {
			label: "Español",
			currency: "USD",
		},
		fr: {
			label: "Français",
			currency: "USD",
		},
		zh: {
			label: "简体中文",
			currency: "USD",
		},
	},
	defaultLocale: "en",
	defaultCurrency: "USD",
	localeCookieName: "locale",
} as const satisfies I18nConfig;

export type Locale = keyof typeof config.locales;
