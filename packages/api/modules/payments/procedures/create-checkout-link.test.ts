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

vi.mock("@repo/logs", () => ({
	logger: {
		error: vi.fn(),
	},
}));

vi.mock("@repo/database", () => ({
	getOrganizationById: vi.fn(),
	getOrganizationMembership: vi.fn(),
}));

vi.mock("@repo/payments", () => ({
	createCheckoutLink: vi.fn(),
	findPriceByPlanId: vi.fn(),
	getCustomerIdFromEntity: vi.fn(),
	getProviderPriceIdByPlanId: vi.fn(),
	isPlanId: vi.fn(),
}));

vi.mock("../../organizations/lib/membership", () => ({
	verifyOrganizationBillingManagement: vi.fn(),
}));

import { auth } from "@repo/auth";
import { getOrganizationById } from "@repo/database";
import {
	createCheckoutLink as createCheckoutLinkFn,
	findPriceByPlanId,
	getCustomerIdFromEntity,
	getProviderPriceIdByPlanId,
	isPlanId,
} from "@repo/payments";

import { verifyOrganizationBillingManagement } from "../../organizations/lib/membership";
import { createCheckoutLink } from "./create-checkout-link";

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

describe("createCheckoutLink", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth.api.getSession).mockResolvedValue(authenticatedSession);
	});

	it("rejects checkout management for an unauthorized organization", async () => {
		vi.mocked(verifyOrganizationBillingManagement).mockResolvedValueOnce(null);

		await expect(
			call(
				createCheckoutLink,
				{
					planId: "pro",
					type: "subscription",
					interval: "month",
					organizationId: "org-1",
				},
				context,
			),
		).rejects.toMatchObject({ code: "FORBIDDEN" });

		expect(getCustomerIdFromEntity).not.toHaveBeenCalled();
		expect(createCheckoutLinkFn).not.toHaveBeenCalled();
	});

	it("allows organization billing managers to create checkout links", async () => {
		vi.mocked(verifyOrganizationBillingManagement).mockResolvedValueOnce({
			organization: {
				id: "org-1",
				name: "Test Organization",
				slug: "test-organization",
				logo: null,
				createdAt: new Date(),
				metadata: null,
				paymentsCustomerId: null,
			},
			role: "admin",
		});
		vi.mocked(getCustomerIdFromEntity).mockResolvedValueOnce(null);
		vi.mocked(isPlanId).mockReturnValueOnce(true);
		vi.mocked(findPriceByPlanId).mockReturnValueOnce({
			type: "subscription",
			interval: "month",
			amount: 29,
			currency: "USD",
			priceId: "price-pro-monthly",
			seatBased: true,
		});
		vi.mocked(getProviderPriceIdByPlanId).mockReturnValueOnce("price-pro-monthly");
		vi.mocked(getOrganizationById).mockResolvedValueOnce({
			id: "org-1",
			name: "Test Organization",
			slug: "test-organization",
			logo: null,
			createdAt: new Date(),
			metadata: null,
			paymentsCustomerId: null,
			members: [
				{
					id: "membership-1",
					organizationId: "org-1",
					userId: "user-1",
					role: "admin",
					createdAt: new Date(),
				},
			],
			invitations: [],
		});
		vi.mocked(createCheckoutLinkFn).mockResolvedValueOnce("https://checkout.example.com");

		const result = await call(
			createCheckoutLink,
			{
				planId: "pro",
				type: "subscription",
				interval: "month",
				organizationId: "org-1",
			},
			context,
		);

		expect(verifyOrganizationBillingManagement).toHaveBeenCalledWith("org-1", "user-1");
		expect(getCustomerIdFromEntity).toHaveBeenCalledWith({ organizationId: "org-1" });
		expect(createCheckoutLinkFn).toHaveBeenCalledWith(
			expect.objectContaining({
				email: "test@example.com",
				organizationId: "org-1",
				priceId: "price-pro-monthly",
				seats: 1,
			}),
		);
		expect(result).toEqual({ checkoutLink: "https://checkout.example.com" });
	});
});
