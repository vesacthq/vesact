/**
 * Returns the base URL for the current app. Pass the env value directly so the
 * bundler can replace it at build time (e.g. import.meta.env.VITE_STUDIO_URL).
 *
 * @param envValue - The env value to use when defined (e.g. import.meta.env.VITE_STUDIO_URL)
 * @param defaultPort - Port for localhost fallback when no env is set (default: 3000)
 */
export function getBaseUrl(envValue?: string, defaultPort = 3000): string {
	if (envValue) {
		return envValue;
	}
	return `http://localhost:${process.env.PORT ?? defaultPort}`;
}

/**
 * The domain a session cookie must be set on so every product sees it: the
 * parent of the account center's hostname (`account.vesact.com` →
 * `.vesact.com`, `account.preview.vesact.com` → `.preview.vesact.com`).
 * `localhost` has no parent, so local cookies stay host-only.
 */
export function getCookieDomain(url: string): string | undefined {
	const hostname = new URL(url).hostname;
	const labels = hostname.split(".");
	const isIpAddress = labels.every((label) => /^\d+$/.test(label));
	return labels.length >= 3 && !isIpAddress ? `.${labels.slice(1).join(".")}` : undefined;
}

/**
 * Returns the list of origins the app considers its own. Used as the
 * single source of truth for both the API CORS allow-list and better-auth's
 * `trustedOrigins` (origin/CSRF and callback/redirect URL validation), so the
 * two never drift apart. Always includes the Studio, account center and Relay
 * origins and adds the marketing site when configured.
 */
export function getTrustedOrigins(): string[] {
	const studioUrl = getBaseUrl(process.env.VITE_STUDIO_URL, 3000);
	const marketingUrl = process.env.VITE_MARKETING_URL;
	const accountUrl = getBaseUrl(process.env.VITE_ACCOUNT_URL, 3004);
	const relayUrl = getBaseUrl(process.env.VITE_RELAY_URL, 3005);
	return [
		...new Set([studioUrl, accountUrl, relayUrl, marketingUrl].filter((url) => url !== undefined)),
	];
}
