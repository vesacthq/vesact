import { call } from "@orpc/server";
import type { Session } from "@repo/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@repo/database", async () => {
	const { z } = await import("zod");

	return {
		PurchaseSchema: z.object({
			id: z.string(),
			organizationId: z.string().nullable(),
			userId: z.string().nullable(),
			type: z.enum(["SUBSCRIPTION", "ONE_TIME"]),
			customerId: z.string(),
			subscriptionId: z.string().nullable(),
			priceId: z.string(),
			status: z.string().nullable(),
			createdAt: z.date(),
			updatedAt: z.date().nullable(),
		}),
		getPurchasesByOrganizationId: vi.fn(),
		getPurchasesByUserId: vi.fn(),
	};
});

vi.mock("@repo/payments", () => ({
	getPlanIdByProviderPriceId: vi.fn(() => "pro"),
	getPlanPriceByProviderPriceId: vi.fn(() => ({
		planId: "pro",
		price: {
			type: "subscription",
			interval: "month",
			amount: 29,
			currency: "USD",
		},
	})),
}));

vi.mock("../../organizations/lib/membership", () => ({
	verifyOrganizationMembership: vi.fn(),
}));

import { auth } from "@repo/auth";
import { getPurchasesByOrganizationId, getPurchasesByUserId, type Purchase } from "@repo/database";

import { verifyOrganizationMembership } from "../../organizations/lib/membership";
import { listPurchases } from "./list-purchases";

const context = { context: { headers: new Headers() } };

const authenticatedSession = {
	session: {
		id: "session-1",
		createdAt: new Date(),
		updatedAt: new Date(),
		userId: "user-1",
		expiresAt: new Date(Date.now() + 60_000),
		token: "session-token",
		ipAddress: null,
		userAgent: null,
		impersonatedBy: null,
		activeOrganizationId: null,
	},
	user: {
		id: "user-1",
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		role: "user",
		banned: null,
		banReason: null,
		banExpires: null,
		onboardingComplete: true,
		locale: null,
		twoFactorEnabled: false,
		lastActiveOrganizationId: null,
	},
} satisfies Session;

const purchase = {
	id: "purchase-1",
	organizationId: null,
	userId: "user-1",
	type: "SUBSCRIPTION",
	customerId: "customer-1",
	subscriptionId: "subscription-1",
	priceId: "price-pro-monthly",
	status: "active",
	createdAt: new Date(),
	updatedAt: null,
} satisfies Purchase;

describe("listPurchases", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
	});

	it("lists current user purchases when no organization is provided", async () => {
		vi.mocked(getPurchasesByUserId).mockResolvedValueOnce([purchase]);

		const result = await call(listPurchases, {}, context);

		expect(getPurchasesByUserId).toHaveBeenCalledWith("user-1");
		expect(getPurchasesByOrganizationId).not.toHaveBeenCalled();
		expect(result).toMatchObject([
			{
				id: "purchase-1",
				planId: "pro",
				planPrice: {
					type: "subscription",
					interval: "month",
					amount: 29,
					currency: "USD",
				},
			},
		]);
	});

	it("rejects organization purchase reads for non-members", async () => {
		vi.mocked(verifyOrganizationMembership).mockResolvedValueOnce(null);

		await expect(call(listPurchases, { organizationId: "org-1" }, context)).rejects.toMatchObject({
			code: "FORBIDDEN",
		});
		expect(getPurchasesByOrganizationId).not.toHaveBeenCalled();
	});

	it("lists organization purchases for organization members", async () => {
		vi.mocked(verifyOrganizationMembership).mockResolvedValue({
			organization: {
				id: "org-1",
				name: "Test Organization",
				slug: "test-organization",
				logo: null,
				createdAt: new Date(),
				metadata: null,
				paymentsCustomerId: null,
			},
			role: "member",
		});
		vi.mocked(getPurchasesByOrganizationId).mockResolvedValueOnce([
			{
				...purchase,
				organizationId: "org-1",
				userId: null,
			},
		]);

		const result = await call(listPurchases, { organizationId: "org-1" }, context);

		expect(verifyOrganizationMembership).toHaveBeenCalledWith("org-1", "user-1");
		expect(getPurchasesByOrganizationId).toHaveBeenCalledWith("org-1");
		expect(result).toMatchObject([{ id: "purchase-1", planId: "pro" }]);
	});
});
