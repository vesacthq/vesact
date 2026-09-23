import { startAnalytics, trackEvent } from "@repo/analytics";
import { useEffect } from "react";

export function AnalyticsScript() {
	useEffect(() => {
		startAnalytics({
			product: "vesact-www",
			key: import.meta.env.VITE_POSTHOG_KEY as string | undefined,
			host: import.meta.env.VITE_POSTHOG_HOST as string | undefined,
			appUrl: import.meta.env.VITE_VESACT_WWW_URL as string | undefined,
			enabled: import.meta.env.PROD,
		});
	}, []);

	return null;
}

export function useAnalytics() {
	return { trackEvent };
}
