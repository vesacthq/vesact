export const organizationRoles = ["owner", "admin", "member"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export const products = ["studio", "relay"] as const;
export type Product = (typeof products)[number];

export const productRoles = {
	studio: ["studio:admin", "studio:member"],
	relay: ["relay:admin", "relay:developer"],
} as const satisfies Record<Product, readonly `${Product}:${string}`[]>;
export type ProductRole = (typeof productRoles)[Product][number];

export type MemberRole = OrganizationRole | ProductRole;

const knownRoles: ReadonlySet<string> = new Set([
	...organizationRoles,
	...Object.values(productRoles).flat(),
]);

/**
 * `member.role` holds every role of one membership as a comma-separated list:
 * one organization role plus at most one role per product. Unknown entries
 * are dropped so a stale value can never grant anything.
 */
export function parseMemberRoles(role: string | null | undefined): MemberRole[] {
	return (role ?? "")
		.split(",")
		.map((entry) => entry.trim())
		.filter((entry): entry is MemberRole => knownRoles.has(entry));
}

export function serializeMemberRoles(roles: readonly MemberRole[]): string {
	return [...new Set(roles)].join(",");
}

export function getOrganizationRole(roles: readonly MemberRole[]): OrganizationRole | null {
	return organizationRoles.find((role) => roles.includes(role)) ?? null;
}

export function getProductRole(roles: readonly MemberRole[], product: Product): ProductRole | null {
	return productRoles[product].find((role) => roles.includes(role)) ?? null;
}

export function withOrganizationRole(
	roles: readonly MemberRole[],
	role: OrganizationRole,
): MemberRole[] {
	return [role, ...roles.filter((entry) => !isOrganizationRole(entry))];
}

export function withProductRole(
	roles: readonly MemberRole[],
	product: Product,
	role: ProductRole | null,
): MemberRole[] {
	const kept = roles.filter(
		(entry) => !(productRoles[product] as readonly string[]).includes(entry),
	);
	return role ? [...kept, role] : kept;
}

export function isOrganizationRole(role: string): role is OrganizationRole {
	return (organizationRoles as readonly string[]).includes(role);
}

export function productOfRole(role: ProductRole): Product {
	return role.split(":")[0] as Product;
}
