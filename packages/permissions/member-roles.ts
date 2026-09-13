export const organizationRoles = ["owner", "admin", "member"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

/**
 * Rows written before the product prefixes were dropped still carry them
 * next to the organization role; only that role counts.
 */
export function parseMemberRole(role: string | null | undefined): OrganizationRole | null {
	const entries = (role ?? "").split(",").map((entry) => entry.trim());
	return organizationRoles.find((candidate) => entries.includes(candidate)) ?? null;
}

export function isOrganizationRole(role: string): role is OrganizationRole {
	return (organizationRoles as readonly string[]).includes(role);
}
