import { deLocalizeUrl, localizeUrl } from "@repo/i18n/routing";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
	});
}
