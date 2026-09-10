import { getBaseUrl } from "@repo/utils";
import { withQuery } from "ufo";

const accountUrl = getBaseUrl(import.meta.env.VITE_ACCOUNT_URL as string | undefined, 3004);
const studioUrl = getBaseUrl(import.meta.env.VITE_STUDIO_URL as string | undefined, 3000);

function absolute(href: string) {
	return new URL(href, studioUrl).toString();
}

/**
 * Identity flows live in the account center. `href` is the Studio location to
 * come back to once the flow completes, as the router reports it (path,
 * search and hash).
 */
export function loginUrl(href: string): string {
	return withQuery(new URL("/login", accountUrl).toString(), { redirectTo: absolute(href) });
}

export function onboardingUrl(href: string): string {
	return withQuery(new URL("/onboarding", accountUrl).toString(), { redirectTo: absolute(href) });
}

/**
 * Settings pages of the account center. `from` is the Studio page the link
 * sits on; the account center's back button returns there.
 */
export function accountCenterUrl(path: string, from?: string): string {
	const url = new URL(path, accountUrl);

	if (from) {
		url.searchParams.set("from", absolute(from));
	}

	return url.toString();
}
