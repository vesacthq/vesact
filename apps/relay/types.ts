export type Theme = "light" | "dark";

export interface RelayConfig {
	appName: string;
	/**
	 * Absolute URL of the Relay API, without `/v1`. Set `VITE_RELAY_API_URL`.
	 */
	apiUrl: string;
	enabledThemes: readonly Theme[];
	defaultTheme: Theme;
}
