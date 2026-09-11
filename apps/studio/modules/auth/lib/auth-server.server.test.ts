import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
	listOrganizations: vi.fn(),
	getFullOrganization: vi.fn(),
}));

vi.mock("@repo/auth", () => ({ auth: { api } }));
vi.mock("@repo/database", () => ({ getInvitationById: vi.fn() }));
vi.mock("@tanstack/react-start/server", () => ({ getRequestHeaders: () => new Headers() }));

import {
	getActiveOrganization,
	getActiveOrganizationById,
	getOrganizationList,
} from "./auth-server.server";

const organization = { id: "org-1", slug: "acme", name: "Acme", members: [] };

beforeEach(() => {
	api.listOrganizations.mockReset();
	api.getFullOrganization.mockReset();
});

describe("getOrganizationList", () => {
	it("propagates a failure and answers again once the backend recovers", async () => {
		api.listOrganizations
			.mockRejectedValueOnce(new Error("connection reset"))
			.mockResolvedValueOnce([organization]);

		await expect(getOrganizationList()).rejects.toThrow("connection reset");
		await expect(getOrganizationList()).resolves.toEqual([organization]);
	});
});

describe.each([
	["getActiveOrganization", () => getActiveOrganization("acme")],
	["getActiveOrganizationById", () => getActiveOrganizationById("org-1")],
])("%s", (_name, load) => {
	it.each([
		"ORGANIZATION_NOT_FOUND",
		"USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION",
		"NO_ACTIVE_ORGANIZATION",
	])("is null when Better Auth answers %s", async (code) => {
		api.getFullOrganization.mockRejectedValueOnce(
			new APIError("UNAUTHORIZED", { code, message: code.toLowerCase() }),
		);

		await expect(load()).resolves.toBeNull();
	});

	it("propagates an expired session instead of pretending there is no organization", async () => {
		api.getFullOrganization.mockRejectedValueOnce(new APIError("UNAUTHORIZED"));

		await expect(load()).rejects.toBeInstanceOf(APIError);
	});

	it("propagates a failure and answers again once the backend recovers", async () => {
		api.getFullOrganization
			.mockRejectedValueOnce(new Error("connection reset"))
			.mockResolvedValueOnce(organization);

		await expect(load()).rejects.toThrow("connection reset");
		await expect(load()).resolves.toEqual(organization);
	});
});
