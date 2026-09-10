import type { ValidateDefinition } from "permix";

/**
 * Central permission schema for the products and the oRPC API.
 *
 * - `admin.access` — global platform admin (`user.role === "admin"`)
 * - `organization.read` — any organization member
 * - `organization.manage` — organization owner/admin, or global admin
 * - `organization.delete` — organization owner only
 * - `organization.manageBilling` — organization owner/admin (no global-admin escalation)
 * - `organization.accessBillingPortal` — organization owner only
 * - `<product>.access` — organization owner/admin, or a member holding a role of that product
 * - `<product>.manage` — organization owner/admin, or the product's admin role
 */
export type PermissionsDefinition = ValidateDefinition<{
	admin: ["access"];
	organization: ["read", "manage", "delete", "manageBilling", "accessBillingPortal"];
	studio: ["access", "manage"];
	relay: ["access", "manage"];
}>;
