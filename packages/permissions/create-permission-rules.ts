import {
	getOrganizationRole,
	getProductRole,
	parseMemberRoles,
	type Product,
} from "./member-roles";

export type PermissionUser = {
	role?: string | null;
} | null;

export type CreatePermissionRulesParams = {
	user?: PermissionUser;
	membershipRole?: string | null;
};

export type ProductPermissionRules = {
	access: boolean;
	manage: boolean;
};

export type PermissionRules = {
	admin: {
		access: boolean;
	};
	organization: {
		read: boolean;
		manage: boolean;
		delete: boolean;
		manageBilling: boolean;
		accessBillingPortal: boolean;
	};
	studio: ProductPermissionRules;
	relay: ProductPermissionRules;
};

/**
 * Build a Permix rules object from the current user and optional org membership role.
 * Call sites that already resolved membership pass the raw `member.role` value;
 * otherwise leave it null.
 */
export function createPermissionRules({
	user,
	membershipRole = null,
}: CreatePermissionRulesParams): PermissionRules {
	const isGlobalAdmin = user?.role === "admin";
	const roles = parseMemberRoles(membershipRole);
	const organizationRole = getOrganizationRole(roles);
	const isMember = roles.length > 0;
	const isOrganizationAdminRole = organizationRole === "owner" || organizationRole === "admin";
	const isOrganizationOwnerRole = organizationRole === "owner";

	// Organization owners and admins administer every product; a plain member
	// only reaches the products they were granted a role in.
	const product = (name: Product): ProductPermissionRules => {
		const role = getProductRole(roles, name);
		return {
			access: isOrganizationAdminRole || role !== null,
			manage: isOrganizationAdminRole || role === `${name}:admin`,
		};
	};

	return {
		admin: {
			access: isGlobalAdmin,
		},
		organization: {
			read: isMember,
			manage: isOrganizationAdminRole || isGlobalAdmin,
			delete: isOrganizationOwnerRole,
			manageBilling: isOrganizationAdminRole,
			accessBillingPortal: isOrganizationOwnerRole,
		},
		studio: product("studio"),
		relay: product("relay"),
	};
}
