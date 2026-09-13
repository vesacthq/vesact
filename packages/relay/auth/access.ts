import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Better Auth's organization access control with one Relay statement: API
 * keys belong to the organization, and the api-key plugin checks these
 * actions on its own endpoints. Owners and admins manage keys, members read.
 */
export const statement = {
	...defaultStatements,
	apiKey: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
	owner: ac.newRole({ ...ownerAc.statements, apiKey: ["create", "read", "update", "delete"] }),
	admin: ac.newRole({ ...adminAc.statements, apiKey: ["create", "read", "update", "delete"] }),
	member: ac.newRole({ ...memberAc.statements, apiKey: ["read"] }),
};
