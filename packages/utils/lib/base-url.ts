/**
 * Returns the base URL for the current app. Pass the env value directly so the
 * bundler can replace it at build time (e.g. import.meta.env.VITE_SAAS_URL).
 *
 * @param envValue - The env value to use when defined (e.g. import.meta.env.VITE_SAAS_URL)
 * @param defaultPort - Port for localhost fallback when no env is set (default: 3000)
 */
export function getBaseUrl(envValue?: string, defaultPort = 3000): string {
	if (envValue) {
		return envValue;
	}
	return `http://localhost:${process.env.PORT ?? defaultPort}`;
}

/**
 * Returns the list of origins the app considers its own. Used as the
 * single source of truth for both the API CORS allow-list and better-auth's
 * `trustedOrigins` (origin/CSRF and callback/redirect URL validation), so the
 * two never drift apart. Always includes the SaaS app origin and adds the
 * marketing site origin when configured.
 */
export function getTrustedOrigins(): string[] {
	const saasUrl = getBaseUrl(process.env.VITE_SAAS_URL, 3000);
	const marketingUrl = process.env.VITE_MARKETING_URL;
	return [saasUrl, ...(marketingUrl ? [marketingUrl] : [])];
}
