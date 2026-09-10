export type Theme = "light" | "dark";

export interface AccountAppConfig {
	/**
	 * Name shown in document titles. The account center belongs to the
	 * account, not to one product, so this is the company name.
	 */
	appName: string;
	/**
	 * The product users land in after signing in when no `redirectTo` is given
	 * and the product a "back" link points to when no `from` is given.
	 * Set `VITE_STUDIO_URL`.
	 */
	studioUrl?: string;
	/**
	 * Absolute URL of the Relay console. Set `VITE_RELAY_URL`.
	 */
	relayUrl?: string;
	/**
	 * Absolute URL for the public marketing site. Set `VITE_MARKETING_URL`.
	 */
	marketingUrl?: string;
	enabledThemes: readonly Theme[];
	defaultTheme: Theme;
}
