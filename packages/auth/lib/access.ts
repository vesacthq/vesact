import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Better Auth's organization access control with its default statements.
 * `member.role` holds one of these roles; the products derive their Permix
 * rules from the same value in `@repo/permissions`.
 */
export const statement = {
	...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const roles = {
	owner: ac.newRole(ownerAc.statements),
	admin: ac.newRole(adminAc.statements),
	member: ac.newRole(memberAc.statements),
};
