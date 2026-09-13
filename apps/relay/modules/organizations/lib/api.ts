import { getOrganizationBySlug, getOrganizationList } from "@auth/lib/auth-server.server";
import { authClient } from "@repo/relay/auth/client";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

const loadOrganizationListFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => ({ result: await getOrganizationList() }),
);

export const organizationListQueryKey = ["user", "organizations"] as const;

export const organizationListQueryOptions = () =>
	queryOptions({
		queryKey: organizationListQueryKey,
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

/** The session remembers the active organization; `/` opens it. */
export async function setActiveOrganization(organizationSlug: string) {
	const { data, error } = await authClient.organization.setActive({ organizationSlug });

	if (error) {
		throw error;
	}

	return data;
}
