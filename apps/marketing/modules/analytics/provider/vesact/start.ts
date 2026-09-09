type PostHog = {
	init: (key: string, options: Record<string, unknown>) => void;
	capture: (event: string, data?: Record<string, unknown>) => void;
	identify: (distinctId: string) => void;
	group: (groupType: string, groupKey: string) => void;
	reset: () => void;
	register: (properties: Record<string, unknown>) => void;
};

const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined;
const appUrl = import.meta.env.VITE_MARKETING_URL as string | undefined;

let loading: Promise<void> | undefined;

export function posthog() {
	return (window as unknown as { posthog?: PostHog }).posthog;
}

function servedFromAppUrl() {
	if (!appUrl) {
		return false;
	}
	try {
		return new URL(appUrl).hostname === window.location.hostname;
	} catch {
		return false;
	}
}

export function startAnalytics() {
	if (!posthogKey || !posthogHost || !servedFromAppUrl()) {
		return Promise.resolve();
	}

	loading ??= new Promise<void>((resolve) => {
		const script = document.createElement("script");
		script.src = `${posthogHost}/static/array.js`;
		script.async = true;
		script.onload = () => {
			posthog()?.init(posthogKey, {
				api_host: posthogHost,
				ui_host: "https://us.posthog.com",
				person_profiles: "identified_only",
				defaults: "2025-05-24",
			});
			posthog()?.register({ product: "marketing" });
			resolve();
		};
		script.onerror = () => resolve();
		document.head.appendChild(script);
	});

	return loading;
}
