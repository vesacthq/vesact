import { useEffect } from "react";

import { posthog, startAnalytics } from "./start";

export function AnalyticsScript() {
	useEffect(() => {
		void startAnalytics();
	}, []);

	return null;
}

export function useAnalytics() {
	return {
		trackEvent: (event: string, data?: Record<string, unknown>) => {
			posthog()?.capture(event, data);
		},
	};
}
