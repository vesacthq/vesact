import { basePath } from "@repo/utils";

import type { Brand } from "./logo";

const maskIconColor: Record<Brand, string> = { vesact: "#006AFE", allcast: "#3B8FFF" };

/**
 * The tags of `brand/<brand>/web/head.example.html`; the files they point to
 * are copied from the same directory into each app's `public/`. Rendered inside
 * `<head>` next to `HeadContent` because a route's `head()` keeps one meta
 * per name, and `theme-color` needs one entry per color scheme.
 */
export function BrandHead({ brand = "vesact" }: { brand?: Brand }) {
	return (
		<>
			<link rel="icon" href={`${basePath}/favicon.ico`} sizes="16x16 32x32 48x48" />
			<link rel="icon" href={`${basePath}/favicon.svg`} type="image/svg+xml" sizes="any" />
			<link rel="apple-touch-icon" href={`${basePath}/apple-touch-icon.png`} sizes="180x180" />
			<link
				rel="mask-icon"
				href={`${basePath}/safari-pinned-tab.svg`}
				color={maskIconColor[brand]}
			/>
			<link rel="manifest" href={`${basePath}/site.webmanifest`} />
			<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
			<meta name="theme-color" content="#0E1317" media="(prefers-color-scheme: dark)" />
		</>
	);
}
