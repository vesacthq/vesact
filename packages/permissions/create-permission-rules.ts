import { parseMemberRole } from "./member-roles";

export type PermissionUser = {
	role?: string | null;
} | null;

export type CreatePermissionRulesParams = {
	user?: PermissionUser;
	membershipRole?: string | null;
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
	studio: {
		access: boolean;
		manage: boolean;
	};
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
	const organizationRole = parseMemberRole(membershipRole);
	const isMember = organizationRole !== null;
	const isOrganizationAdminRole = organizationRole === "owner" || organizationRole === "admin";
	const isOrganizationOwnerRole = organizationRole === "owner";

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
		studio: {
			access: isMember,
			manage: isOrganizationAdminRole,
		},
	};
}
