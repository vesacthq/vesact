import { getBaseUrl } from "@repo/utils";

const authUrl = getBaseUrl(import.meta.env.VITE_AUTH_URL as string | undefined, 3004);
const studioUrl = getBaseUrl(import.meta.env.VITE_STUDIO_URL as string | undefined, 3000);

/**
 * Login lives in the auth app. `href` is the Studio location to come back to,
 * as the router reports it (path, search and hash).
 */
export function loginUrl(href: string): string {
	const url = new URL("/login", authUrl);
	url.searchParams.set("redirectTo", new URL(href, studioUrl).toString());
	return url.toString();
}

export function accountSecurityUrl(): string {
	return new URL("/account", authUrl).toString();
}
