import type { AccountAppConfig } from "./types";

export const config = {
	appName: "Allcast",
	studioUrl: import.meta.env.VITE_STUDIO_URL as string | undefined,
	marketingUrl: import.meta.env.VITE_MARKETING_URL as string | undefined,
	icpFilingNumber: import.meta.env.VITE_ICP_FILING_NUMBER as string | undefined,
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies AccountAppConfig;
