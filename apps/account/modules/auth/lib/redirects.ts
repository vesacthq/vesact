import { withQuery } from "ufo";

const accountOrigin = import.meta.env.VITE_ACCOUNT_URL;
const studioUrl = import.meta.env.VITE_STUDIO_URL;
const relayUrl = import.meta.env.VITE_RELAY_URL;
const marketingUrl = import.meta.env.VITE_MARKETING_URL;

export interface ProductUrl {
	name: string;
	url: string | undefined;
}

export const products: ProductUrl[] = [
	{ name: "Studio", url: studioUrl },
	{ name: "Relay", url: relayUrl },
	{ name: "Vesact", url: marketingUrl },
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

export const allowedRedirectOrigins = [...products.map((product) => product.url), accountOrigin]
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

/**
 * Settings pages are opened from a product with `from=<absolute URL>`; the
 * "back" button returns there. Without `from` it returns to Studio.
 */
export function getReturnUrl(
	from: string | null | undefined,
	options: { fallback: string; allowedOrigins?: string[] } = { fallback: studioUrl ?? "/" },
): string {
	return getSafeRedirectUrl(from, options);
}

export function productNameForUrl(url: string, knownProducts: ProductUrl[] = products): string {
	const origin = toOrigin(url);
	return knownProducts.find((product) => toOrigin(product.url) === origin)?.name ?? "Vesact";
}

export function invitationUrl(invitationId: string): string {
	return `/invitations/${invitationId}`;
}

export function onboardingUrl(redirectTo: string): string {
	return withQuery("/onboarding", { redirectTo });
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
