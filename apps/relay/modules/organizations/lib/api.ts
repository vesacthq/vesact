import { getOrganizationBySlug, getOrganizationList } from "@auth/lib/auth-server.server";
import { authClient } from "@repo/auth/client";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

const loadOrganizationListFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => ({ result: await getOrganizationList() }),
);

export const organizationListQueryOptions = () =>
	queryOptions({
		queryKey: ["user", "organizations"],
		queryFn: async () => (await loadOrganizationListFn()).result,
	});

const loadOrganizationFn = createServerFn({ method: "GET", strict: false })
	.validator((organizationSlug: string) => organizationSlug)
	.handler(async ({ data: organizationSlug }) => ({
		result: await getOrganizationBySlug(organizationSlug),
	}));

export const organizationQueryOptions = (slug: string) =>
	queryOptions({
		queryKey: ["organization", slug],
		queryFn: async () => (await loadOrganizationFn({ data: slug })).result,
	});

/**
 * The active organization is shared with Studio through the session; `/` in
 * either product opens it, and a new login restores it from the user.
 */
export async function setActiveOrganization(organizationSlug: string) {
	const { data, error } = await authClient.organization.setActive({ organizationSlug });

	if (error) {
		throw error;
	}

	await authClient.updateUser({
		lastActiveOrganizationId: data?.id ?? null,
	} as Parameters<typeof authClient.updateUser>[0]);

	return data;
}
