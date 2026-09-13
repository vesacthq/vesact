import type { roles } from "@repo/relay/auth/access";

export const organizationRoles = [
	"owner",
	"admin",
	"member",
] as const satisfies readonly (keyof typeof roles)[];

export type OrganizationRole = (typeof organizationRoles)[number];

export function isOrganizationRole(value: unknown): value is OrganizationRole {
	return organizationRoles.includes(value as OrganizationRole);
}

/** Better Auth stores roles comma-separated; Relay assigns exactly one. */
export function memberRole(role: string | null | undefined): OrganizationRole {
	return role?.split(",").find(isOrganizationRole) ?? "member";
}

export function canManageMembers(role: OrganizationRole) {
	return role === "owner" || role === "admin";
}
