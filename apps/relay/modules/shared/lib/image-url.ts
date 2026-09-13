/**
 * Relay stores no images of its own: user pictures come from Google as
 * absolute URLs and organizations have no logo upload, so only an absolute
 * URL can be shown.
 */
export function imageUrl(pathOrUrl: string): string | undefined {
	return pathOrUrl.startsWith("http") ? pathOrUrl : undefined;
}
