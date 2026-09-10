export { config, type Locale } from "./config";
export { getMessagesForLocale } from "./lib/get-messages";
export { createTranslatorForLocale, getMessagesForLocaleSync } from "./messages";
export {
	createLocaleCookieHeader,
	defaultLocale,
	extractLocaleFromPath,
	isValidLocale,
	localeCookieName,
	locales,
	normalizeLocale,
	parseLocaleCookie,
	resolveLocaleFromPathname,
	shouldIgnorePath,
	stripLocaleFromPath,
} from "./shared";
export { default as defaultMailTranslations } from "./translations/en/mail.json";
export type {
	AuthMessages,
	MailMessages,
	MarketingMessages,
	StudioMessages,
	SharedMessages,
} from "./types";
