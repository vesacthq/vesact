import { call } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@repo/database", () => ({
	deleteOrganization: vi.fn(),
	getOrganizationById: vi.fn(),
	getOrganizationMembership: vi.fn(),
	getPurchasesByOrganizationId: vi.fn(),
}));

vi.mock("@repo/payments", () => ({
	cancelSubscription: vi.fn(),
}));

import { auth } from "@repo/auth";
import {
	deleteOrganization,
	getOrganizationById,
	getPurchasesByOrganizationId,
} from "@repo/database";
import { cancelSubscription } from "@repo/payments";

import { deleteOrganization as deleteOrganizationProcedure } from "./delete-organization";

const context = { context: { headers: new Headers() } };
const adminSession = {
	user: { id: "admin-1", role: "admin" },
	session: { id: "session-1", activeOrganizationId: null },
};

describe("admin deleteOrganization", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never);
		vi.mocked(getOrganizationById).mockResolvedValue({ id: "org-1" } as never);
		vi.mocked(getPurchasesByOrganizationId).mockResolvedValue([]);
	});

	it("rejects non-admins", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			...adminSession,
			user: { id: "user-1", role: "user" },
		} as never);

		await expect(call(deleteOrganizationProcedure, { id: "org-1" }, context)).rejects.toMatchObject(
			{
				code: "FORBIDDEN",
			},
		);
		expect(deleteOrganization).not.toHaveBeenCalled();
	});

	it("returns NOT_FOUND for an unknown organization", async () => {
		vi.mocked(getOrganizationById).mockResolvedValue(undefined);

		await expect(
			call(deleteOrganizationProcedure, { id: "missing" }, context),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		expect(deleteOrganization).not.toHaveBeenCalled();
	});

	it("cancels active subscriptions before deleting", async () => {
		vi.mocked(getPurchasesByOrganizationId).mockResolvedValue([
			{ type: "SUBSCRIPTION", subscriptionId: "sub-1" },
			{ type: "SUBSCRIPTION", subscriptionId: null },
			{ type: "ONE_TIME", subscriptionId: null },
		] as never);

		const result = await call(deleteOrganizationProcedure, { id: "org-1" }, context);

		expect(cancelSubscription).toHaveBeenCalledTimes(1);
		expect(cancelSubscription).toHaveBeenCalledWith("sub-1");
		expect(deleteOrganization).toHaveBeenCalledWith("org-1");
		expect(result).toEqual({ id: "org-1" });
	});

	it("keeps the organization when a subscription cannot be cancelled", async () => {
		vi.mocked(getPurchasesByOrganizationId).mockResolvedValue([
			{ type: "SUBSCRIPTION", subscriptionId: "sub-1" },
		] as never);
		vi.mocked(cancelSubscription).mockRejectedValue(new Error("provider down"));

		await expect(call(deleteOrganizationProcedure, { id: "org-1" }, context)).rejects.toThrow(
			"provider down",
		);
		expect(deleteOrganization).not.toHaveBeenCalled();
	});
});
