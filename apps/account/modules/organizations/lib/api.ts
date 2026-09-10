import type { ActiveOrganization, Organization } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const organizationListQueryKey = ["user", "organizations"] as const;

export const useOrganizationListQuery = (initialData?: Organization[]) => {
	return useQuery({
		queryKey: organizationListQueryKey,
		queryFn: async () => {
			const { data, error } = await authClient.organization.list();

			if (error) {
				throw new Error(error.message || "Failed to fetch organizations");
			}

			return data;
		},
		...(initialData ? { initialData } : {}),
	});
};

export const organizationQueryKey = (slug: string) => ["organization", slug] as const;

export const useOrganizationQuery = (slug: string, initialData?: ActiveOrganization) => {
	return useQuery({
		queryKey: organizationQueryKey(slug),
		queryFn: async () => {
			const { data, error } = await authClient.organization.getFullOrganization({
				query: { organizationSlug: slug },
			});

			if (error) {
				throw new Error(error.message || "Failed to fetch organization");
			}

			return data;
		},
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
