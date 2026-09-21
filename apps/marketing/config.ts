import type { MarketingConfig } from "./types";

export const config = {
	appName: "Allcast",
	docsUrl: import.meta.env.VITE_DOCS_URL as string | undefined,
	studioUrl: import.meta.env.VITE_STUDIO_URL as string | undefined,
	accountUrl: import.meta.env.VITE_ACCOUNT_URL as string | undefined,
	icpFilingNumber: import.meta.env.VITE_ICP_FILING_NUMBER as string | undefined,
	placeholderSiteName: import.meta.env.VITE_PLACEHOLDER_SITE_NAME as string | undefined,
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies MarketingConfig;
