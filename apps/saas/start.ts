import { createMiddleware, createStart } from "@tanstack/react-start";
import { createPermix as createCorePermix } from "permix";

import { buildPermissionRulesForRequest } from "./modules/shared/lib/build-permission-rules";
import { permix } from "./modules/shared/lib/permix";

// Own createMiddleware().server() boundary so TanStack can strip server-only
// imports. permix@4.1.2 setupMiddleware() hides .server() inside the package,
// which would leave auth/database in the client graph (and "*.server.*"
// dynamic imports are denied by import-protection).
const permixMiddleware = createMiddleware().server(async ({ next, request }) => {
	const rules = await buildPermissionRulesForRequest(request);
	const instance = createCorePermix(rules);
	return next({ context: { [permix.key]: instance } });
});

export const startInstance = createStart(() => ({
	requestMiddleware: [permixMiddleware],
}));
