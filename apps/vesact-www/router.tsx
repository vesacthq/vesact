import { deLocalizeUrl, localizeUrl } from "@repo/i18n/routing";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		// Preload route code + loader data on hover/focus for snappier
		// navigation across the site.
		defaultPreload: "intent",
		defaultPreloadStaleTime: 30_000,
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
	});
}
