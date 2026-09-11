import type { RelayConfig } from "./types";

export const config = {
	appName: "Relay",
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies RelayConfig;
