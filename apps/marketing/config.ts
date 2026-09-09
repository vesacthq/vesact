import type { MarketingConfig } from "./types";

export const config = {
	appName: "Vesact",
	docsUrl: import.meta.env.VITE_DOCS_URL as string | undefined,
	saasUrl: import.meta.env.VITE_SAAS_URL as string | undefined,
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies MarketingConfig;
