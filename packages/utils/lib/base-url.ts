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
 * The domain a session cookie must be set on while the account center still
 * answers on its own hostname: the parent of that hostname
 * (`account.vesact.com` → `.vesact.com`). Once it is mounted under the Studio
 * hostname the cookie stays host-only and this is unused.
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
 * two never drift apart. Always includes the Studio and account center
 * origins and adds the marketing site when configured. The account center's
 * URL may carry a path (`/account`); only origins are compared.
 */
export function getTrustedOrigins(): string[] {
	const studioUrl = getBaseUrl(process.env.VITE_STUDIO_URL, 3000);
	const marketingUrl = process.env.VITE_MARKETING_URL;
	const accountUrl = getBaseUrl(process.env.VITE_ACCOUNT_URL, 3004);
	return [
		...new Set(
			[studioUrl, accountUrl, marketingUrl]
				.filter((url) => url !== undefined)
				.map((url) => new URL(url).origin),
		),
	];
}
