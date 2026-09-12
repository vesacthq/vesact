import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getSession } from "./auth-server.server";

const loadSessionFn = createServerFn({ method: "GET", strict: false }).handler(async () => ({
	result: await getSession(),
}));

/**
 * One session read per page load: route guards go through
 * `queryClient.ensureQueryData`, so client-side navigation reuses it.
 */
export const sessionQueryOptions = () =>
	queryOptions({
		queryKey: ["user", "session"],
		queryFn: async () => (await loadSessionFn()).result,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		retry: false,
	});
