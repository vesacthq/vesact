import { sessionQueryKey, useSessionQuery } from "@auth/lib/api";
import type { Session } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";

import { SessionContext } from "../lib/session-context";

export function SessionProvider({
	children,
	initialSession,
}: {
	children: ReactNode;
	initialSession?: Session | null;
}) {
	const queryClient = useQueryClient();

	const { data: session } = useSessionQuery(initialSession);
	const [loaded, setLoaded] = useState(!!session);

	useEffect(() => {
		if (session && !loaded) {
			setLoaded(true);
		}
	}, [session]); // oxlint-disable-line eslint-plugin-react-hooks/exhaustive-deps

	return (
		<SessionContext.Provider
			value={{
				loaded,
				session: session?.session ?? null,
				user: session?.user ?? null,
				reloadSession: async () => {
					const { data: newSession, error } = await authClient.getSession({
						query: {
							disableCookieCache: true,
						},
					});

					if (error) {
						throw new Error(error.message || "Failed to fetch session");
					}

					queryClient.setQueryData(sessionQueryKey, () => newSession);
				},
			}}
		>
			{children}
		</SessionContext.Provider>
	);
}
