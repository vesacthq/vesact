import { getOrganizationBySlug, getOrganizationList } from "@auth/lib/auth-server.server";
import type { ActiveOrganization, Organization } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { orpcClient } from "@shared/lib/orpc-client";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
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

export const useOrganizationListQuery = (initialData?: Organization[]) => {
	return useQuery({
		...organizationListQueryOptions(),
		...(initialData ? { initialData } : {}),
	});
};

const loadOrganizationFn = createServerFn({ method: "GET", strict: false })
	.validator((organizationSlug: string) => organizationSlug)
	.handler(async ({ data: organizationSlug }) => ({
		result: await getOrganizationBySlug(organizationSlug),
	}));

export const organizationQueryKey = (slug: string) => ["organization", slug] as const;

export const organizationQueryOptions = (slug: string) =>
	queryOptions({
		queryKey: organizationQueryKey(slug),
		queryFn: async () => (await loadOrganizationFn({ data: slug })).result,
	});

export const useOrganizationQuery = (slug: string, initialData?: ActiveOrganization) => {
	return useQuery({
		...organizationQueryOptions(slug),
		...(initialData ? { initialData } : {}),
	});
};

export const useCreateOrganizationMutation = () => {
	return useMutation({
		mutationKey: ["create-organization"],
		mutationFn: async ({ name }: { name: string }) => {
			const { slug } = await orpcClient.organizations.generateSlug({ name });

			const { error, data } = await authClient.organization.create({ name, slug });

			if (error) {
				throw error;
			}

			return data;
		},
	});
};

/**
 * Products open the organization that was active last, so an organization the
 * user just created or joined becomes the active one before they go back.
 */
export async function setActiveOrganization(organizationSlug: string) {
	const { data } = await authClient.organization.setActive({ organizationSlug });

	await authClient.updateUser({
		lastActiveOrganizationId: data?.id ?? null,
	} as Parameters<typeof authClient.updateUser>[0]);
}
