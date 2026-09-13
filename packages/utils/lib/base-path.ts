/// <reference types="vite/client" />

/**
 * The path the app is mounted on, from Vite's `base` (`/` for Studio,
 * `/account/` for the account center under the Studio hostname): `""` or
 * `"/account"`. The router strips it before route matching; request URLs,
 * `window.location` and hand-built hrefs carry it.
 */
export const basePath = (import.meta.env?.BASE_URL ?? "/").replace(/\/$/, "") as "" | `/${string}`;

/** The app path of a browser or request pathname. */
export function stripBasePath(pathname: string): string {
	if (!basePath) {
		return pathname;
	}
	if (pathname === basePath) {
		return "/";
	}
	return pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : pathname;
}

/** The browser pathname of an app path; the app root keeps its trailing slash. */
export function withBasePath(pathname: string): string {
	return pathname === "/" ? `${basePath}/` : `${basePath}${pathname}`;
}
