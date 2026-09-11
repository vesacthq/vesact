import { deLocalizeUrl, localizeUrl } from "@repo/i18n/routing";
import type { PermissionsDefinition } from "@repo/permissions";
import { createQueryClient } from "@shared/lib/query-client";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createPermix } from "permix";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const permix = createPermix<PermissionsDefinition>();
	const queryClient = createQueryClient();

	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		context: {
			permix,
			queryClient,
		},
		rewrite: {
			input: ({ url }) => deLocalizeUrl(url),
			output: ({ url }) => localizeUrl(url),
		},
	});

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
}
