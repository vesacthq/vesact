import type { StudioConfig } from "./types";

export const config = {
	appName: "Studio",
	docsUrl: import.meta.env.VITE_DOCS_URL as string | undefined,
	marketingUrl: import.meta.env.VITE_MARKETING_URL as string | undefined,
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
	redirectAfterSignIn: "/",
	redirectAfterLogout: "/login",
	enableAiDemo: true,
} as const satisfies StudioConfig;
