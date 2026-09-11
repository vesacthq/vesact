import { call } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@repo/auth/config", () => ({
	config: { organizations: { forbiddenOrganizationSlugs: ["admin"] } },
}));

vi.mock("@repo/database", async () => {
	const { z } = await import("zod");

	return {
		OrganizationSchema: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
		MemberSchema: z.object({ id: z.string() }),
		InvitationSchema: z.object({ id: z.string() }),
		getOrganizationById: vi.fn(),
		getOrganizationBySlug: vi.fn(),
		getOrganizationMembership: vi.fn(),
		updateOrganization: vi.fn(),
	};
});

import { auth } from "@repo/auth";
import { getOrganizationById, getOrganizationBySlug, updateOrganization } from "@repo/database";

import { updateOrganization as updateOrganizationProcedure } from "./update-organization";

const context = { context: { headers: new Headers() } };
const adminSession = {
	user: { id: "admin-1", role: "admin" },
	session: { id: "session-1", activeOrganizationId: null },
};
const organization = { id: "org-1", name: "Acme", slug: "acme", members: [], invitations: [] };

describe("admin updateOrganization", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(auth.api.getSession).mockResolvedValue(adminSession as never);
		vi.mocked(getOrganizationById).mockResolvedValue(organization as never);
		vi.mocked(getOrganizationBySlug).mockResolvedValue(undefined);
	});

	it("rejects non-admins", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			...adminSession,
			user: { id: "user-1", role: "user" },
		} as never);

		await expect(
			call(updateOrganizationProcedure, { id: "org-1", name: "Acme" }, context),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(updateOrganization).not.toHaveBeenCalled();
	});

	it("rejects a reserved slug", async () => {
		await expect(
			call(updateOrganizationProcedure, { id: "org-1", name: "Admin", slug: "admin" }, context),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		expect(updateOrganization).not.toHaveBeenCalled();
	});

	it("rejects a slug that belongs to another organization", async () => {
		vi.mocked(getOrganizationBySlug).mockResolvedValue({ id: "org-2", slug: "acme" } as never);

		await expect(
			call(updateOrganizationProcedure, { id: "org-1", name: "Acme", slug: "acme" }, context),
		).rejects.toMatchObject({ code: "CONFLICT" });
		expect(updateOrganization).not.toHaveBeenCalled();
	});

	it("updates the name without touching the slug when none is given", async () => {
		const result = await call(
			updateOrganizationProcedure,
			{ id: "org-1", name: "Acme Co" },
			context,
		);

		expect(updateOrganization).toHaveBeenCalledWith({ id: "org-1", name: "Acme Co" });
		expect(result).toMatchObject({ id: "org-1" });
	});

	it("keeps the organization's own slug", async () => {
		vi.mocked(getOrganizationBySlug).mockResolvedValue({ id: "org-1", slug: "acme" } as never);

		await call(updateOrganizationProcedure, { id: "org-1", name: "Acme", slug: "acme" }, context);

		expect(updateOrganization).toHaveBeenCalledWith({ id: "org-1", name: "Acme", slug: "acme" });
	});

	it("returns NOT_FOUND for an unknown organization", async () => {
		vi.mocked(getOrganizationById).mockResolvedValue(undefined);

		await expect(
			call(updateOrganizationProcedure, { id: "missing", name: "Acme" }, context),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
