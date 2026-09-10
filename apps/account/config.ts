import type { AccountAppConfig } from "./types";

export const config = {
	appName: "Vesact",
	studioUrl: import.meta.env.VITE_STUDIO_URL as string | undefined,
	relayUrl: import.meta.env.VITE_RELAY_URL as string | undefined,
	marketingUrl: import.meta.env.VITE_MARKETING_URL as string | undefined,
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies AccountAppConfig;
