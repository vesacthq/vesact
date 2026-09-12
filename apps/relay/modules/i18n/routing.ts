import { deLocalizeHref } from "@repo/i18n/routing";
import { useRouterState } from "@tanstack/react-router";

export function useLocalePathname(): string {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	return deLocalizeHref(pathname);
}
