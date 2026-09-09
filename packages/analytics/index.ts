import posthog from "posthog-js";

export type AnalyticsOptions = {
	/** The product the events belong to, so one project can hold several. */
	product: string;
	/** Public project key. */
	key?: string;
	/** Reverse proxy that forwards to PostHog. */
	host?: string;
	/** The app's own public URL; events are only sent when served from it. */
	appUrl?: string;
	/** Pass `import.meta.env.PROD` so development builds stay silent. */
	enabled?: boolean;
};

let started = false;

function servedFromAppUrl(appUrl: string) {
	try {
		return new URL(appUrl).hostname === window.location.hostname;
	} catch {
		return false;
	}
}

export function startAnalytics({ product, key, host, appUrl, enabled }: AnalyticsOptions) {
	if (started || !enabled || !key || !host || !appUrl || !servedFromAppUrl(appUrl)) {
		return;
	}

	started = true;
	posthog.init(key, {
		api_host: host,
		ui_host: "https://us.posthog.com",
		person_profiles: "identified_only",
		defaults: "2025-05-24",
	});
	posthog.register({ product });
}

export function trackEvent(event: string, data?: Record<string, unknown>) {
	if (started) {
		posthog.capture(event, data);
	}
}

export function identifyUser(userId: string | null) {
	if (!started) {
		return;
	}
	if (userId) {
		posthog.identify(userId);
	} else {
		posthog.reset();
	}
}

export function setOrganization(organizationId: string | null) {
	if (started && organizationId) {
		posthog.group("organization", organizationId);
	}
}
