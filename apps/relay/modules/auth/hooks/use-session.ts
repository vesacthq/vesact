import { useRouteContext } from "@tanstack/react-router";

export function useSession() {
	return useRouteContext({ from: "/_authenticated", select: (context) => context.session });
}
