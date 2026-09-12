import { config, type Locale } from "./config";

export const defaultLocale = config.defaultLocale;
export const localeCookieName = config.localeCookieName;
export const locales = Object.keys(config.locales) as Locale[];

const localePattern = new RegExp(`^/(${locales.join("|")})(?:/|$)`);
const ignoredPathsRegex =
	/^\/(?:api|rpc|_build|_serverFn|assets|brand)(?:\/|$)|^\/[^/]+\.[a-z0-9]+$/;

export function isValidLocale(locale: string | undefined): locale is Locale {
	return typeof locale === "string" && locales.includes(locale as Locale);
}

export function normalizeLocale(locale: string | undefined | null): Locale {
	return isValidLocale(locale ?? undefined) ? (locale as Locale) : defaultLocale;
}

export function shouldIgnorePath(pathname: string): boolean {
	return ignoredPathsRegex.test(pathname);
}

export function extractLocaleFromPath(pathname: string): Locale | null {
	const match = localePattern.exec(pathname);
	const locale = match?.[1];
	return isValidLocale(locale) ? locale : null;
}

export function stripLocaleFromPath(pathname: string): string {
	const locale = extractLocaleFromPath(pathname);
	if (!locale) {
		return pathname || "/";
	}

	const stripped = pathname.replace(`/${locale}`, "");
	return stripped || "/";
}

export function parseLocaleCookie(cookieHeader: string | null | undefined): Locale | null {
	if (!cookieHeader) {
		return null;
	}

	const cookies = cookieHeader.split(";");
	for (const cookie of cookies) {
		const [rawName, ...rawValue] = cookie.trim().split("=");
		if (rawName === localeCookieName) {
			return normalizeLocale(decodeURIComponent(rawValue.join("=")));
		}
	}

	return null;
}

export function createLocaleCookieHeader(locale: Locale): string {
	return `${localeCookieName}=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function resolveLocaleFromPathname(pathname: string, cookieHeader?: string | null): Locale {
	if (shouldIgnorePath(pathname)) {
		return parseLocaleCookie(cookieHeader) ?? defaultLocale;
	}

	return extractLocaleFromPath(pathname) ?? defaultLocale;
}
