import { config as i18nConfig } from "@i18n/config";
import { getBaseUrl } from "@shared/lib/base-url";
import { getUniqueBasePaths } from "@shared/lib/content";
import { createFileRoute } from "@tanstack/react-router";
import { allLegalPages, allPosts } from "content-collections";

interface ContentDocument {
	path: string;
}

const staticMarketingPages = ["", "/blog", "/changelog", "/contact"];

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const sitemap = createSitemap();

				return new Response(sitemap, {
					headers: {
						"Content-Type": "application/xml",
					},
				});
			},
		},
	},
});

function createSitemap() {
	const urls = [
		...staticMarketingPages.flatMap((page) => localizedUrls(page)),
		...uniqueBasePaths(allPosts.filter((post) => post.published)).flatMap((postPath) =>
			localizedUrls(`/blog/${postPath}`),
		),
		...uniqueBasePaths(allLegalPages).flatMap((legalPath) => localizedUrls(`/legal/${legalPath}`)),
	];

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.map((url) => sitemapUrl(url)),
		"</urlset>",
		"",
	].join("\n");
}

function uniqueBasePaths(documents: ContentDocument[]) {
	return getUniqueBasePaths(documents).sort();
}

function localizedUrls(routePath: string) {
	return Object.keys(i18nConfig.locales).map(
		(locale) => new URL(localePath(locale, routePath), getBaseUrl()).href,
	);
}

function localePath(locale: string, routePath: string) {
	const prefix = locale === i18nConfig.defaultLocale ? "" : `/${locale}`;
	return `${prefix}${routePath}`;
}

function sitemapUrl(loc: string) {
	return ["<url>", `<loc>${loc}</loc>`, "</url>"].join("");
}
