import { localizeHref } from "@repo/i18n/routing";
import { cn } from "@repo/ui";

/**
 * Build-time HTML from content-collections. In-site links get the current
 * locale prefix; links to other sites open in a new tab.
 */
export function PostContent({ html, className }: { html: string; className?: string }) {
	const localized = html
		.replace(/href="(\/[^"]*)"/g, (_match, href: string) => `href="${localizeHref(href)}"`)
		.replace(
			/<a href="(https?:\/\/[^"]*)"/g,
			'<a target="_blank" rel="noopener noreferrer" href="$1"',
		);

	return (
		<div
			className={cn("prose dark:prose-invert mt-8 max-w-2xl", className)}
			dangerouslySetInnerHTML={{ __html: localized }}
		/>
	);
}
