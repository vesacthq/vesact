import { authClient } from "@repo/auth/client";
import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const adminOrganizationQueryKey = (id: string) => ["admin", "organization", id] as const;

export const useAdminOrganizationQuery = (id: string) => {
	return useQuery({
		enabled: id !== "new" && id.length > 0,
		queryKey: adminOrganizationQueryKey(id),
		queryFn: async () => {
			const { data, error } = await authClient.organization.getFullOrganization({
				query: { organizationId: id },
			});

			if (error) {
				throw new Error(error.message || "Failed to fetch organization");
			}

			return data;
		},
	});
};

export const useUpdateOrganizationMutation = () => {
	return useMutation({
		mutationKey: ["update-organization"],
		mutationFn: async ({
			id,
			name,
			updateSlug,
		}: {
			id: string;
			name: string;
			updateSlug?: boolean;
		}) => {
			const slug = updateSlug
				? (await orpcClient.organizations.generateSlug({ name })).slug
				: undefined;

			const { error, data } = await authClient.organization.update({
				organizationId: id,
				data: { name, slug },
			});

			if (error) {
				throw error;
			}

			return data;
		},
	});
};
