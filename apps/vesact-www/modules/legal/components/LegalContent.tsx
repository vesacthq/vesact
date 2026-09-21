import { localizeHref } from "@repo/i18n/routing";
import { cn } from "@repo/ui";

/** Build-time HTML from content-collections; in-site links get the current locale prefix. */
export function LegalContent({ html, className }: { html: string; className?: string }) {
	const localized = html.replace(
		/href="(\/[^"]*)"/g,
		(_match, href: string) => `href="${localizeHref(href)}"`,
	);

	return (
		<div
			className={cn("prose dark:prose-invert mt-8 max-w-2xl", className)}
			dangerouslySetInnerHTML={{ __html: localized }}
		/>
	);
}
