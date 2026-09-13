import { createPermix } from "permix";

import { createPermissionRules, type CreatePermissionRulesParams } from "./create-permission-rules";
import type { PermissionsDefinition } from "./definition";

export type PermissionPath =
	| "admin.access"
	| "organization.read"
	| "organization.manage"
	| "organization.delete"
	| "organization.manageBilling"
	| "organization.accessBillingPortal"
	| "studio.access"
	| "studio.manage";

/**
 * Evaluate a single permission against rules derived from the user + membership role.
 * Useful outside of a live Permix context (helpers, procedure handlers with a specific org).
 */
export function checkPermission(
	params: CreatePermissionRulesParams,
	path: PermissionPath,
): boolean {
	const permix = createPermix<PermissionsDefinition>();
	permix.setup(createPermissionRules(params));
	return permix.check(path);
}
