import { withBasePath } from "@repo/utils";

/**
 * An app path (`/login`) as an absolute URL on this origin, with the path the
 * app is mounted on. For callbacks handed to Better Auth, payments and
 * anything else that leaves the router.
 */
export function appUrl(path: string): string {
	return new URL(withBasePath(path), window.location.origin).toString();
}
