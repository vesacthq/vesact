import { getBaseUrl } from "@repo/utils";

const accountUrl = getBaseUrl(import.meta.env.VITE_ACCOUNT_URL as string | undefined, 3004);
const studioUrl = getBaseUrl(import.meta.env.VITE_STUDIO_URL as string | undefined, 3000);

/**
 * Login lives in the account center. `href` is the Studio location to come back to,
 * as the router reports it (path, search and hash).
 */
export function loginUrl(href: string): string {
	const url = new URL("/login", accountUrl);
	url.searchParams.set("redirectTo", new URL(href, studioUrl).toString());
	return url.toString();
}

export function accountSecurityUrl(): string {
	return new URL("/account", accountUrl).toString();
}
