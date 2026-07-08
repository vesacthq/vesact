declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
	}
}

const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID as string | undefined;

export function AnalyticsScript() {
	if (!googleAnalyticsId) {
		return null;
	}

	return (
		<>
			<script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: analytics boot script
				dangerouslySetInnerHTML={{
					__html: `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');
`,
				}}
			/>
		</>
	);
}

export function useAnalytics() {
	return {
		trackEvent: (event: string, data?: Record<string, unknown>) => {
			window.gtag?.("event", event, data ?? {});
		},
	};
}
