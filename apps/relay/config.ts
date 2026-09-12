import { getBaseUrl } from "@repo/utils";

import type { RelayConfig } from "./types";

export const config = {
	appName: "Relay",
	apiUrl: getBaseUrl(import.meta.env.VITE_RELAY_API_URL, 3005),
	enabledThemes: ["light", "dark"],
	defaultTheme: "light",
} as const satisfies RelayConfig;
