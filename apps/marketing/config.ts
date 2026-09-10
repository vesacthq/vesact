import type { MarketingConfig } from "./types";

export const config = {
	appName: "Vesact",
	docsUrl: import.meta.env.VITE_DOCS_URL as string | undefined,
	studioUrl: import.meta.env.VITE_STUDIO_URL as string | undefined,
	accountUrl: import.meta.env.VITE_ACCOUNT_URL as string | undefined,
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies MarketingConfig;
