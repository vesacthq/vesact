import {
	getActiveOrganization,
	getActiveOrganizationById,
	getOrganizationList,
} from "@auth/lib/auth-server.server";
import type { ActiveOrganization, OrganizationMetadata } from "@repo/auth";
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

export const useOrganizationListQuery = () => {
	return useQuery(organizationListQueryOptions());
};

export interface ActiveOrganizationIdentifier {
	slug?: string;
	id?: string;
}

const loadActiveOrganizationFn = createServerFn({ method: "GET", strict: false })
	.validator((identifier: ActiveOrganizationIdentifier) => identifier)
	.handler(async ({ data: { slug, id } }) => ({
		result: slug
			? await getActiveOrganization(slug)
			: id
				? await getActiveOrganizationById(id)
				: null,
	}));

export const activeOrganizationQueryKey = (identifier: ActiveOrganizationIdentifier) =>
	["user", "activeOrganization", identifier.slug ?? identifier.id ?? ""] as const;

export const activeOrganizationQueryOptions = (identifier: ActiveOrganizationIdentifier) =>
	queryOptions({
		queryKey: activeOrganizationQueryKey(identifier),
		queryFn: async () => (await loadActiveOrganizationFn({ data: identifier })).result,
	});

export const useActiveOrganizationQuery = (
	identifier: ActiveOrganizationIdentifier,
	options?: {
		enabled?: boolean;
		initialData?: ActiveOrganization | null;
	},
) => {
	const cacheKey = identifier.slug ?? identifier.id ?? "";

	return useQuery({
		...activeOrganizationQueryOptions(identifier),
		enabled: options?.enabled && !!cacheKey,
		...(options?.initialData ? { initialData: options.initialData } : {}),
	});
};

export const fullOrganizationQueryKey = (id: string) => ["fullOrganization", id] as const;
export const useFullOrganizationQuery = (id: string) => {
	return useQuery({
		enabled: id !== "new" && id.length > 0,
		queryKey: fullOrganizationQueryKey(id),
		queryFn: async () => {
			const { data, error } = await authClient.organization.getFullOrganization({
				query: {
					organizationId: id,
				},
			});

			if (error) {
				throw new Error(error.message || "Failed to fetch full organization");
			}

			return data;
		},
	});
};

/*
 * Create organization
 */
export const createOrganizationMutationKey = ["create-organization"] as const;
export const useCreateOrganizationMutation = () => {
	return useMutation({
		mutationKey: createOrganizationMutationKey,
		mutationFn: async ({ name, metadata }: { name: string; metadata?: OrganizationMetadata }) => {
			const { slug } = await orpcClient.organizations.generateSlug({
				name,
			});

			const { error, data } = await authClient.organization.create({
				name,
				slug,
				metadata,
			});

			if (error) {
				throw error;
			}

			return data;
		},
	});
};

/*
 * Update organization
 */
export const updateOrganizationMutationKey = ["update-organization"] as const;
export const useUpdateOrganizationMutation = () => {
	return useMutation({
		mutationKey: updateOrganizationMutationKey,
		mutationFn: async ({
			id,
			name,
			metadata,
			updateSlug,
		}: {
			id: string;
			name: string;
			metadata?: OrganizationMetadata;
			updateSlug?: boolean;
		}) => {
			const slug = updateSlug
				? (
						await orpcClient.organizations.generateSlug({
							name,
						})
					).slug
				: undefined;

			const { error, data } = await authClient.organization.update({
				organizationId: id,
				data: {
					name,
					slug,
					metadata,
				},
			});

			if (error) {
				throw error;
			}

			return data;
		},
	});
};
