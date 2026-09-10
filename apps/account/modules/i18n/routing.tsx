import type { Locale } from "@repo/i18n";
import { deLocalizeHref, localizeHref, localizeUrl } from "@repo/i18n/routing";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { redirect, useRouterState } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { config } from "./config";

export const routing = {
	locales: Object.keys(config.locales),
	defaultLocale: config.defaultLocale,
	localeCookieName: config.localeCookieName,
};

export type LocaleLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
	href: string;
	children?: ReactNode | ((state: { isActive: boolean; isTransitioning: boolean }) => ReactNode);
};

function isExternalHref(href: string) {
	return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

function normalizePathname(pathname: string) {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname || "/";
}

function localizedAppHref(href: string, hashLinkBasePath: string): string {
	if (href.startsWith("#")) {
		return `${localizeHref(hashLinkBasePath)}${href}`;
	}
	if (!href.startsWith("/")) {
		return href;
	}
	const url = new URL(href, "http://localhost");
	const pathQueryHash = url.pathname + url.search + url.hash;
	const delocalized = deLocalizeHref(pathQueryHash);
	return localizeHref(delocalized);
}

function resolveLocaleLinkChildren(children: LocaleLinkProps["children"]): ReactNode {
	if (typeof children === "function") {
		return children({ isActive: false, isTransitioning: false });
	}
	return children;
}

export function LocaleLink({ href, children, ...rest }: LocaleLinkProps) {
	const pathnameForHash = useRouterState({
		select: (s) => normalizePathname(s.location.pathname),
	});

	if (isExternalHref(href)) {
		return (
			<a href={href} {...rest}>
				{resolveLocaleLinkChildren(children)}
			</a>
		);
	}

	const appHref = localizedAppHref(href, pathnameForHash);
	return (
		<a href={appHref} {...rest}>
			{resolveLocaleLinkChildren(children)}
		</a>
	);
}

export function useLocalePathname(): string {
	const pathname = useRouterState({
		select: (s) => s.location.pathname,
	});
	return deLocalizeHref(pathname);
}

export function useLocaleRouter() {
	return {
		replace: (pathWithQuery: string, options?: { locale?: string }) => {
			if (typeof window === "undefined") {
				return;
			}
			const locale = (options?.locale ?? getCurrentLocale()) as Locale;
			const base = window.location.origin;
			const normalized = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
			const delocalized = deLocalizeHref(normalized);
			const target = localizeUrl(new URL(delocalized, base).href, { locale });
			window.location.assign(target.href);
		},
	};
}

export function localeRedirect(options: { href: string }) {
	const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
	const url = new URL(options.href.startsWith("/") ? options.href : `/${options.href}`, base);
	const search = Object.fromEntries(url.searchParams);
	throw redirect({
		to: url.pathname || "/",
		...(Object.keys(search).length > 0 ? { search: search as never } : {}),
		...(url.hash ? { hash: url.hash.slice(1) } : {}),
	});
}
