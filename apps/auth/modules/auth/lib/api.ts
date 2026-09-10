import type { Session } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { useQuery } from "@tanstack/react-query";

export const sessionQueryKey = ["user", "session"] as const;

/**
 * Client-side session query.
 *
 * We DON'T pass `disableCookieCache: true` here so Better Auth's built-in
 * short-lived session cookie cache can short-circuit repeat reads that happen
 * on every navigation. Callers that just performed a write (update user,
 * change email, accept invitation, etc.) should call `reloadSession()` from
 * the session context, which bypasses the cache explicitly.
 */
export const useSessionQuery = (initialData?: Session | null) => {
	return useQuery({
		queryKey: sessionQueryKey,
		queryFn: async () => {
			const { data, error } = await authClient.getSession();

			if (error) {
				throw new Error(error.message || "Failed to fetch session");
			}

			return data;
		},
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		retry: false,
		...(initialData ? { initialData } : {}),
	});
};

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
