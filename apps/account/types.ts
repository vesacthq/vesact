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
	 * Absolute URL for the public marketing site. Set `VITE_MARKETING_URL`.
	 */
	marketingUrl?: string;
	/**
	 * ICP filing number shown under the auth pages, linked to beian.miit.gov.cn.
	 * Set `VITE_ICP_FILING_NUMBER` on the domestic build only; omitted, nothing is rendered.
	 */
	icpFilingNumber?: string;
	enabledThemes: readonly Theme[];
	defaultTheme: Theme;
}
