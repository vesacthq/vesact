import type { Locale } from "@repo/i18n";
import { config as i18nConfig } from "@repo/i18n";

/**
 * Sets locale cookie (client-side). Full navigation is handled by LocaleSwitch via
 * `useLocaleRouter` from `@i18n/routing`.
 */
export function setLocaleCookie(locale: Locale): void {
	if (typeof document === "undefined") {
		return;
	}
	document.cookie = `${i18nConfig.localeCookieName}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}
