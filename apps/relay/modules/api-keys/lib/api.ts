import { authClient } from "@repo/relay/auth/client";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Keys are listed, created and revoked through Relay's own api-key endpoints,
 * from the browser with the console session. The list never contains a
 * secret; the create response is the only place it appears.
 */
const apiKeysQueryKey = (organizationId: string) =>
	["organization", organizationId, "api-keys"] as const;

const apiKeysQueryOptions = (organizationId: string) =>
	queryOptions({
		queryKey: apiKeysQueryKey(organizationId),
		queryFn: async () => {
			const { data, error } = await authClient.apiKey.list({ query: { organizationId } });

			if (error) {
				throw error;
			}

			return data.apiKeys;
		},
	});

export function useApiKeysQuery(organizationId: string) {
	return useQuery(apiKeysQueryOptions(organizationId));
}

export function useCreateApiKeyMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ name }: { name: string }) => {
			const { data, error } = await authClient.apiKey.create({ name, organizationId });

			if (error) {
				throw error;
			}

			return data;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeysQueryKey(organizationId) }),
	});
}

export function useRevokeApiKeyMutation(organizationId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ keyId }: { keyId: string }) => {
			const { error } = await authClient.apiKey.delete({ keyId });

			if (error) {
				throw error;
			}
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeysQueryKey(organizationId) }),
	});
}
