/**
 * Where to go after signing in. Only paths of this app are followed: an
 * absolute `redirectTo` could drive an open redirect out of the login page.
 */
export function getSafeRedirectPath(redirectTo: string | null | undefined): string {
	if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
		return "/";
	}
	return redirectTo;
}
