import { ORPCError, call } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@repo/database", () => ({
	getPurchasesByOrganizationId: vi.fn(),
	getPurchasesByUserId: vi.fn(),
}));

vi.mock("@repo/payments", () => ({
	getPlanIdByProviderPriceId: vi.fn(() => "pro"),
	getPlanPriceByProviderPriceId: vi.fn(() => ({ price: 2900 })),
}));

vi.mock("../../organizations/lib/membership", () => ({
	verifyOrganizationMembership: vi.fn(),
}));

import { auth } from "@repo/auth";
import { getPurchasesByOrganizationId, getPurchasesByUserId } from "@repo/database";

import { verifyOrganizationMembership } from "../../organizations/lib/membership";
import { listPurchases } from "./list-purchases";

const context = { context: { headers: new Headers() } };

function mockSession() {
	vi.mocked(auth.api.getSession).mockResolvedValue({
		user: { id: "user-1", email: "user@example.com", name: "User" },
		session: { id: "session-1", userId: "user-1" },
	} as never);
}

describe("listPurchases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists current user purchases when no organization is provided", async () => {
		mockSession();
		vi.mocked(getPurchasesByUserId).mockResolvedValueOnce([
			{ id: "purchase-1", priceId: "price-pro-monthly" },
		] as never);

		const result = await call(listPurchases, {}, context);

		expect(getPurchasesByUserId).toHaveBeenCalledWith("user-1");
		expect(getPurchasesByOrganizationId).not.toHaveBeenCalled();
		expect(result).toMatchObject([{ id: "purchase-1", planId: "pro", planPrice: 2900 }]);
	});

	it("rejects organization purchase reads for non-members", async () => {
		mockSession();
		vi.mocked(verifyOrganizationMembership).mockResolvedValueOnce(null);

		await expect(call(listPurchases, { organizationId: "org-1" }, context)).rejects.toThrow(
			ORPCError,
		);
		await expect(call(listPurchases, { organizationId: "org-1" }, context)).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
		expect(getPurchasesByOrganizationId).not.toHaveBeenCalled();
	});

	it("lists organization purchases for organization members", async () => {
		mockSession();
		vi.mocked(verifyOrganizationMembership).mockResolvedValue({
			organization: { id: "org-1" },
			role: "member",
		} as never);
		vi.mocked(getPurchasesByOrganizationId).mockResolvedValueOnce([
			{ id: "purchase-1", priceId: "price-pro-monthly" },
		] as never);

		const result = await call(listPurchases, { organizationId: "org-1" }, context);

		expect(verifyOrganizationMembership).toHaveBeenCalledWith("org-1", "user-1");
		expect(getPurchasesByOrganizationId).toHaveBeenCalledWith("org-1");
		expect(result).toMatchObject([{ id: "purchase-1", planId: "pro" }]);
	});
});
