import { deLocalizeUrl, localizeUrl } from "@repo/i18n/routing";
import type { PermissionsDefinition } from "@repo/permissions";
import { createRouter } from "@tanstack/react-router";
import { createPermix } from "permix";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const permix = createPermix<PermissionsDefinition>();

	return createRouter({
		routeTree,
		scrollRestoration: true,
		context: {
			permix,
		},
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
	});
}
