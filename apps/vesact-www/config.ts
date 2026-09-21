import type { WwwConfig } from "./types";

export const config = {
	appName: "Vesact",
	consoleUrl: import.meta.env.VITE_RELAY_URL as string | undefined,
	docsUrl: import.meta.env.VITE_DOCS_URL as string | undefined,
	contactEmail: "hello@vesact.com",
	companyName: "西安速准科技有限公司",
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies WwwConfig;
