export type Theme = "light" | "dark";

export interface StudioConfig {
	/**
	 * Human-readable product name shown in navigation, metadata, and other
	 * user-facing surfaces throughout the Studio application.
	 */
	appName: string;
	/**
	 * Absolute URL for the documentation site. When omitted, documentation links
	 * are hidden from the Studio UI. Set `VITE_DOCS_URL` (monorepo root `.env`).
	 */
	docsUrl?: string;
	/**
	 * Absolute URL for the public marketing site. Set `VITE_MARKETING_URL`.
	 */
	marketingUrl?: string;
	/**
	 * Theme options exposed in the theme switcher for this app.
	 */
	enabledThemes: readonly Theme[];
	/**
	 * Theme applied when the user has not explicitly chosen one yet.
	 */
	defaultTheme: Theme;
	/**
	 * Internal path users are sent to after a successful sign-in flow.
	 */
	redirectAfterSignIn: string;
	/**
	 * Internal path users are sent to after logging out of the application.
	 */
	redirectAfterLogout: string;
	/**
	 * Enables the AI chatbot demo route and nav entry. Disable to strip the
	 * demo (and its OpenAI dependency) from the product surface.
	 */
	enableAiDemo: boolean;
}
