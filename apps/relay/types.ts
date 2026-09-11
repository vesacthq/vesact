export type Theme = "light" | "dark";

export interface RelayConfig {
	appName: string;
	enabledThemes: readonly Theme[];
	defaultTheme: Theme;
}
