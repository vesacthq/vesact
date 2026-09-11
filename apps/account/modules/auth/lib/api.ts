import type { Session } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { type QueryClient, queryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getSession } from "./auth-server.server";

export const sessionQueryKey = ["user", "session"] as const;

const loadSessionFn = createServerFn({ method: "GET", strict: false }).handler(async () => ({
	result: await getSession(),
}));

/**
 * One session read per page load: route guards go through
 * `queryClient.ensureQueryData`, so client-side navigation reuses it. Writes
 * that change the session call `reloadSession()` from the session context.
 */
export const sessionQueryOptions = () =>
	queryOptions({
		queryKey: sessionQueryKey,
		queryFn: async () => (await loadSessionFn()).result,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		retry: false,
	});

export const useSessionQuery = (initialData?: Session | null) => {
	return useQuery({
		...sessionQueryOptions(),
		...(initialData ? { initialData } : {}),
	});
};

/**
 * A sign-in changes the answer the guards cached, and the login page may hold
 * `null` with nothing observing it: read the session again, whatever the
 * cache says, before the next client-side navigation.
 */
export function refreshSession(queryClient: QueryClient) {
	return queryClient.fetchQuery({ ...sessionQueryOptions(), staleTime: 0 });
}

export const userAccountQueryKey = ["user", "accounts"] as const;
export const useUserAccountsQuery = () => {
	return useQuery({
		queryKey: userAccountQueryKey,
		queryFn: async () => {
			const { data, error } = await authClient.listAccounts();

			if (error) {
				throw error;
			}

			return data;
		},
	});
};

export const userPasskeyQueryKey = ["user", "passkeys"] as const;
export const useUserPasskeysQuery = () => {
	return useQuery({
		queryKey: userPasskeyQueryKey,
		queryFn: async () => {
			const { data, error } = await authClient.passkey.listUserPasskeys();

			if (error) {
				throw error;
			}

			return data;
		},
	});
};
