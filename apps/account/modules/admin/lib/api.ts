import { orpcClient } from "@shared/lib/orpc-client";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAdminOrganizationQuery = (id: string) => {
	return useQuery({
		...orpc.admin.organizations.find.queryOptions({ input: { id } }),
		enabled: id !== "new" && id.length > 0,
	});
};

export const useUpdateOrganizationMutation = () => {
	return useMutation({
		mutationKey: ["admin", "update-organization"],
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

			return orpcClient.admin.organizations.update({ id, name, slug });
		},
	});
};
