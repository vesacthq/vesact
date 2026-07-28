import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/database", () => ({
	getOrganizationMembership: vi.fn(),
}));

import { getOrganizationMembership } from "@repo/database";

import { verifyOrganizationBillingManagement, verifyOrganizationMembership } from "./membership";

describe("verifyOrganizationMembership", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when membership does not exist", async () => {
		vi.mocked(getOrganizationMembership).mockResolvedValueOnce(undefined);

		const result = await verifyOrganizationMembership("org-1", "user-1");

		expect(result).toBeNull();
	});

	it("returns organization and role when membership exists", async () => {
		const mockMembership = {
			id: "membership-1",
			organizationId: "org-1",
			userId: "user-1",
			role: "owner",
			createdAt: new Date(),
			organization: {
				id: "org-1",
				name: "Test Org",
				slug: "test-org",
				logo: null,
				createdAt: new Date(),
				metadata: null,
				paymentsCustomerId: null,
			},
		};
		vi.mocked(getOrganizationMembership).mockResolvedValueOnce(mockMembership);

		const result = await verifyOrganizationMembership("org-1", "user-1");

		expect(result).toEqual({
			organization: mockMembership.organization,
			role: "owner",
		});
	});

	it("returns only organization and role, not the full membership object", async () => {
		const mockMembership = {
			id: "membership-2",
			organizationId: "org-2",
			userId: "user-2",
			role: "member",
			createdAt: new Date(),
			organization: {
				id: "org-2",
				name: "Another Org",
				slug: "another-org",
				logo: null,
				createdAt: new Date(),
				metadata: null,
				paymentsCustomerId: null,
			},
			extraField: "should-not-be-returned",
		};
		vi.mocked(getOrganizationMembership).mockResolvedValueOnce(mockMembership);

		const result = await verifyOrganizationMembership("org-2", "user-2");

		expect(result).toEqual({
			organization: mockMembership.organization,
			role: "member",
		});
		expect(result).not.toHaveProperty("extraField");
	});
});

describe("verifyOrganizationBillingManagement", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each(["owner", "admin"])("allows organization %s roles", async (role) => {
		vi.mocked(getOrganizationMembership).mockResolvedValueOnce({
			id: "membership-1",
			organizationId: "org-1",
			userId: "user-1",
			role,
			createdAt: new Date(),
			organization: {
				id: "org-1",
				name: "Test Org",
				slug: "test-org",
				logo: null,
				createdAt: new Date(),
				metadata: null,
				paymentsCustomerId: null,
			},
		});

		const result = await verifyOrganizationBillingManagement("org-1", "user-1");

		expect(result?.role).toBe(role);
	});

	it("rejects regular organization members", async () => {
		vi.mocked(getOrganizationMembership).mockResolvedValueOnce({
			id: "membership-1",
			organizationId: "org-1",
			userId: "user-1",
			role: "member",
			createdAt: new Date(),
			organization: {
				id: "org-1",
				name: "Test Org",
				slug: "test-org",
				logo: null,
				createdAt: new Date(),
				metadata: null,
				paymentsCustomerId: null,
			},
		});

		const result = await verifyOrganizationBillingManagement("org-1", "user-1");

		expect(result).toBeNull();
	});
});
