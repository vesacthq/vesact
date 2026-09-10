export type Theme = "light" | "dark";

export interface AuthAppConfig {
	/**
	 * Name shown in document titles. Auth pages belong to the account, not to
	 * one product, so this is the company name.
	 */
	appName: string;
	/**
	 * The product users land in after signing in when no `redirectTo` is given.
	 * Set `VITE_STUDIO_URL`.
	 */
	studioUrl?: string;
	/**
	 * Absolute URL for the public marketing site. Set `VITE_MARKETING_URL`.
	 */
	marketingUrl?: string;
	enabledThemes: readonly Theme[];
	defaultTheme: Theme;
}
