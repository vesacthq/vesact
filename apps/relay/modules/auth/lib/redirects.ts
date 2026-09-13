/**
 * Where to go after signing in. Only paths of this app are followed: an
 * absolute `redirectTo`, or one the browser would read as absolute (`//host`,
 * `/\host`), could drive an open redirect out of the login page.
 */
export function getSafeRedirectPath(redirectTo: string | null | undefined): string {
	if (!redirectTo?.startsWith("/") || redirectTo.startsWith("//") || redirectTo.startsWith("/\\")) {
		return "/";
	}

	const base = "http://relay.invalid";
	try {
		const url = new URL(redirectTo, base);
		return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : "/";
	} catch {
		return "/";
	}
}
