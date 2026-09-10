import { describe, expect, it } from "vitest";

import { checkPermission } from "./check-permission";
import { createPermissionRules } from "./create-permission-rules";

/**
 * Matrix mirrors the pre-Permix semantics from:
 * - packages/auth/lib/helper.ts (isOrganizationAdmin / isOrganizationOwner)
 * - packages/api/orpc/procedures.ts (adminProcedure)
 * - packages/api/modules/organizations/lib/membership.ts (billing management)
 * - payment/org procedure role gates
 */
describe("createPermissionRules matrix", () => {
	it.each([
		{
			label: "global admin without membership",
			user: { role: "admin" },
			membershipRole: null,
			expected: {
				adminAccess: true,
				organizationRead: false,
				organizationManage: true,
				organizationDelete: false,
				organizationManageBilling: false,
				organizationAccessBillingPortal: false,
			},
		},
		{
			label: "organization owner",
			user: { role: "user" },
			membershipRole: "owner",
			expected: {
				adminAccess: false,
				organizationRead: true,
				organizationManage: true,
				organizationDelete: true,
				organizationManageBilling: true,
				organizationAccessBillingPortal: true,
			},
		},
		{
			label: "organization admin",
			user: { role: "user" },
			membershipRole: "admin",
			expected: {
				adminAccess: false,
				organizationRead: true,
				organizationManage: true,
				organizationDelete: false,
				organizationManageBilling: true,
				organizationAccessBillingPortal: false,
			},
		},
		{
			label: "organization member",
			user: { role: "user" },
			membershipRole: "member",
			expected: {
				adminAccess: false,
				organizationRead: true,
				organizationManage: false,
				organizationDelete: false,
				organizationManageBilling: false,
				organizationAccessBillingPortal: false,
			},
		},
		{
			label: "unauthenticated / no membership",
			user: null,
			membershipRole: null,
			expected: {
				adminAccess: false,
				organizationRead: false,
				organizationManage: false,
				organizationDelete: false,
				organizationManageBilling: false,
				organizationAccessBillingPortal: false,
			},
		},
		{
			label: "global admin who is also an organization member",
			user: { role: "admin" },
			membershipRole: "member",
			expected: {
				adminAccess: true,
				organizationRead: true,
				organizationManage: true,
				organizationDelete: false,
				organizationManageBilling: false,
				organizationAccessBillingPortal: false,
			},
		},
		{
			label: "member with a Studio role in the comma-separated column",
			user: { role: "user" },
			membershipRole: "member,studio:member",
			expected: {
				adminAccess: false,
				organizationRead: true,
				organizationManage: false,
				organizationDelete: false,
				organizationManageBilling: false,
				organizationAccessBillingPortal: false,
			},
		},
	] as const)("$label", ({ user, membershipRole, expected }) => {
		const rules = createPermissionRules({ user, membershipRole });

		expect(rules.admin.access).toBe(expected.adminAccess);
		expect(rules.organization.read).toBe(expected.organizationRead);
		expect(rules.organization.manage).toBe(expected.organizationManage);
		expect(rules.organization.delete).toBe(expected.organizationDelete);
		expect(rules.organization.manageBilling).toBe(expected.organizationManageBilling);
		expect(rules.organization.accessBillingPortal).toBe(expected.organizationAccessBillingPortal);

		expect(checkPermission({ user, membershipRole }, "admin.access")).toBe(expected.adminAccess);
		expect(checkPermission({ user, membershipRole }, "organization.read")).toBe(
			expected.organizationRead,
		);
		expect(checkPermission({ user, membershipRole }, "organization.manage")).toBe(
			expected.organizationManage,
		);
		expect(checkPermission({ user, membershipRole }, "organization.delete")).toBe(
			expected.organizationDelete,
		);
		expect(checkPermission({ user, membershipRole }, "organization.manageBilling")).toBe(
			expected.organizationManageBilling,
		);
		expect(checkPermission({ user, membershipRole }, "organization.accessBillingPortal")).toBe(
			expected.organizationAccessBillingPortal,
		);
	});
});

describe("product access", () => {
	it.each([
		["owner", { studio: [true, true], relay: [true, true] }],
		["admin", { studio: [true, true], relay: [true, true] }],
		["member", { studio: [false, false], relay: [false, false] }],
		["member,studio:member", { studio: [true, false], relay: [false, false] }],
		["member,studio:admin,relay:developer", { studio: [true, true], relay: [true, false] }],
		["member,relay:admin", { studio: [false, false], relay: [true, true] }],
		[null, { studio: [false, false], relay: [false, false] }],
	] as const)("%s", (membershipRole, expected) => {
		const rules = createPermissionRules({ user: { role: "user" }, membershipRole });

		expect([rules.studio.access, rules.studio.manage]).toEqual(expected.studio);
		expect([rules.relay.access, rules.relay.manage]).toEqual(expected.relay);
		expect(checkPermission({ user: { role: "user" }, membershipRole }, "studio.access")).toBe(
			expected.studio[0],
		);
	});

	it("does not let a global admin into a product without membership", () => {
		const rules = createPermissionRules({ user: { role: "admin" }, membershipRole: null });

		expect(rules.studio.access).toBe(false);
	});
});
