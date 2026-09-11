import { getBaseUrl } from "@repo/utils";
import { withQuery } from "ufo";

const accountUrl = getBaseUrl(import.meta.env.VITE_ACCOUNT_URL, 3004);
const relayUrl = getBaseUrl(import.meta.env.VITE_RELAY_URL, 3005);

function absolute(href: string) {
	return new URL(href, relayUrl).toString();
}

/**
 * Identity flows live in the account center. `href` is the Relay location to
 * come back to once the flow completes, as the router reports it.
 */
export function loginUrl(href: string): string {
	return withQuery(new URL("/login", accountUrl).toString(), { redirectTo: absolute(href) });
}

/**
 * Settings pages of the account center. `from` is the Relay page the link
 * sits on; the account center's back button returns there.
 */
export function accountCenterUrl(path: string, from?: string): string {
	const url = new URL(path, accountUrl);

	if (from) {
		url.searchParams.set("from", absolute(from));
	}

	return url.toString();
}
