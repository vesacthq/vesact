const accountOrigin = import.meta.env.VITE_ACCOUNT_URL;
const studioUrl = import.meta.env.VITE_STUDIO_URL;
const productOrigins = [
	studioUrl,
	import.meta.env.VITE_MARKETING_URL,
	import.meta.env.VITE_RELAY_URL,
	accountOrigin,
];

function toOrigin(value: string | undefined): string | null {
	if (!value) {
		return null;
	}

	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
}

export const allowedRedirectOrigins = productOrigins
	.map(toOrigin)
	.filter((origin): origin is string => origin !== null);

/**
 * Resolves where to send the user after an auth flow. Relative paths stay on
 * this app; absolute URLs must belong to one of our own products, otherwise
 * `redirectTo` could drive an open redirect out of the login page.
 */
export function getSafeRedirectUrl(
	redirectTo: string | null | undefined,
	options: { fallback: string; allowedOrigins?: string[]; base?: string } = {
		fallback: studioUrl ?? "/",
	},
): string {
	const allowed = options.allowedOrigins ?? allowedRedirectOrigins;
	const base = options.base ?? accountOrigin ?? "http://localhost";

	return normalize(redirectTo, allowed, base) ?? normalize(options.fallback, allowed, base) ?? "/";
}

function normalize(value: string | null | undefined, allowed: string[], base: string) {
	if (!value) {
		return null;
	}

	if (value.startsWith("/")) {
		if (value.startsWith("//") || value.startsWith("/\\")) {
			return null;
		}

		try {
			const url = new URL(value, base);
			return url.origin === new URL(base).origin ? `${url.pathname}${url.search}${url.hash}` : null;
		} catch {
			return null;
		}
	}

	try {
		const url = new URL(value);
		if (!["http:", "https:"].includes(url.protocol) || !allowed.includes(url.origin)) {
			return null;
		}

		return url.toString();
	} catch {
		return null;
	}
}

export function invitationUrl(invitationId: string): string {
	return new URL(`/organization-invitation/${invitationId}`, studioUrl).toString();
}

/**
 * Follows a resolved redirect. Cross-origin targets need a full navigation;
 * the router only knows this app.
 */
export function navigateTo(
	router: { navigate: (options: { href: string; replace?: boolean }) => unknown },
	url: string,
) {
	if (url.startsWith("/")) {
		void router.navigate({ href: url, replace: true });
		return;
	}

	window.location.assign(url);
}
