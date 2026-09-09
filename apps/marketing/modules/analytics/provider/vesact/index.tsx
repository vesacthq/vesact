import { useCookieConsent } from "@shared/hooks/cookie-consent";
import { useEffect } from "react";

import { posthog, startAnalytics } from "./start";

export function AnalyticsScript() {
	const { userHasConsented } = useCookieConsent();

	useEffect(() => {
		if (userHasConsented) {
			void startAnalytics();
		}
	}, [userHasConsented]);

	return null;
}

export function useAnalytics() {
	return {
		trackEvent: (event: string, data?: Record<string, unknown>) => {
			posthog()?.capture(event, data);
		},
	};
}
