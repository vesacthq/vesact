export type Theme = "light" | "dark";

export interface WwwConfig {
	/** Product name used in site chrome, document titles and copy. */
	appName: string;
	/** The console's address, where "Sign in" and "Get started" lead. `VITE_RELAY_URL`. */
	consoleUrl?: string;
	/** The developer docs; documentation links render only when set. `VITE_DOCS_URL`. */
	docsUrl?: string;
	/** The address on the contact page and in the legal pages. */
	contactEmail: string;
	/** The operating company's legal name, shown in the footer and on the contact page. */
	companyName: string;
	/** Theme options available on the site. */
	enabledThemes: readonly Theme[];
	/** Theme used for first-time visitors before a preference is stored. */
	defaultTheme: Theme;
}
