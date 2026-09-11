import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Better Auth's organization access control, extended with one statement per
 * product. The roles mirror `@repo/permissions`: organization owners and
 * admins hold every product permission, plain members only what their product
 * roles grant. Better Auth checks these on its own endpoints; the products
 * derive their Permix rules from the same `member.role` value.
 */
export const statement = {
	...defaultStatements,
	studio: ["access", "manage"],
	relay: ["access", "manage"],
	apiKey: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

const everyProduct = {
	studio: ["access", "manage"],
	relay: ["access", "manage"],
} as const;

// Relay's API keys belong to the organization; the api-key plugin checks
// these actions on its own endpoints.
const apiKeys = { apiKey: ["create", "read", "update", "delete"] } as const;

export const roles = {
	owner: ac.newRole({ ...ownerAc.statements, ...everyProduct, ...apiKeys }),
	admin: ac.newRole({ ...adminAc.statements, ...everyProduct, ...apiKeys }),
	member: ac.newRole({ ...memberAc.statements }),
	"studio:admin": ac.newRole({ studio: ["access", "manage"] }),
	"studio:member": ac.newRole({ studio: ["access"] }),
	"relay:admin": ac.newRole({ relay: ["access", "manage"], ...apiKeys }),
	"relay:developer": ac.newRole({ relay: ["access"], ...apiKeys }),
};
