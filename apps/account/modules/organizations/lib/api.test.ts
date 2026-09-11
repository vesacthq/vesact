import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({
	getOrganizationList: vi.fn(),
	getOrganizationBySlug: vi.fn(),
}));

vi.mock("@auth/lib/auth-server.server", () => server);
vi.mock("@repo/auth/client", () => ({ authClient: {} }));
vi.mock("@shared/lib/orpc-client", () => ({ orpcClient: {} }));
// Without the Start compiler a server function is its handler.
vi.mock("@tanstack/react-start", () => {
	const builder = {
		validator: () => builder,
		handler: (handler: (input: { data: unknown }) => unknown) => (options?: { data?: unknown }) =>
			handler({ data: options?.data }),
	};
	return { createServerFn: () => builder };
});

import { organizationListQueryOptions, organizationQueryOptions } from "./api";

const organization = { id: "org-1", slug: "acme", name: "Acme", members: [] };

function createQueryClient() {
	return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

beforeEach(() => {
	server.getOrganizationList.mockReset();
	server.getOrganizationBySlug.mockReset();
});

describe("organizationListQueryOptions", () => {
	it("does not keep a failed load as an empty list", async () => {
		const queryClient = createQueryClient();
		server.getOrganizationList
			.mockRejectedValueOnce(new Error("connection reset"))
			.mockResolvedValueOnce([organization]);

		await expect(queryClient.ensureQueryData(organizationListQueryOptions())).rejects.toThrow(
			"connection reset",
		);
		await expect(queryClient.ensureQueryData(organizationListQueryOptions())).resolves.toEqual([
			organization,
		]);
		expect(server.getOrganizationList).toHaveBeenCalledTimes(2);
	});
});

describe("organizationQueryOptions", () => {
	it("does not keep a failed lookup as a missing organization", async () => {
		const queryClient = createQueryClient();
		server.getOrganizationBySlug
			.mockRejectedValueOnce(new Error("connection reset"))
			.mockResolvedValueOnce(organization);

		await expect(queryClient.ensureQueryData(organizationQueryOptions("acme"))).rejects.toThrow(
			"connection reset",
		);
		await expect(queryClient.ensureQueryData(organizationQueryOptions("acme"))).resolves.toEqual(
			organization,
		);
	});

	it("keeps a missing organization as null", async () => {
		const queryClient = createQueryClient();
		server.getOrganizationBySlug.mockResolvedValueOnce(null);

		await expect(queryClient.ensureQueryData(organizationQueryOptions("gone"))).resolves.toBeNull();
		await expect(queryClient.ensureQueryData(organizationQueryOptions("gone"))).resolves.toBeNull();
		expect(server.getOrganizationBySlug).toHaveBeenCalledTimes(1);
	});
});
