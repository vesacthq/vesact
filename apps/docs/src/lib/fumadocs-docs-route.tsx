import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
	MarkdownCopyButton,
	ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { Suspense } from "react";

import { useMDXComponents } from "@/components/mdx";
import { baseOptions } from "@/lib/layout.shared";
import { gitConfig } from "@/lib/shared";
import { getPageMarkdownUrl, source } from "@/lib/source";

const serverLoader = createServerFn({
	method: "GET",
})
	.validator((slugs: string[]) => slugs)
	.handler(async ({ data: slugs }) => {
		const page = source.getPage(slugs);
		if (!page) throw notFound();

		return {
			path: page.path,
			markdownUrl: getPageMarkdownUrl(page).url,
			pageTree: await source.serializePageTree(source.getPageTree()),
		};
	});

const clientLoader = browserCollections.docs.createClientLoader({
	component(
		{ toc, frontmatter, default: MDX },
		{
			markdownUrl,
			path,
		}: {
			markdownUrl: string;
			path: string;
		},
	) {
		return (
			<DocsPage toc={toc}>
				<DocsTitle>{frontmatter.title}</DocsTitle>
				<DocsDescription>{frontmatter.description}</DocsDescription>
				<div className="gap-2 -mt-4 pb-6 flex flex-row items-center border-b">
					<MarkdownCopyButton markdownUrl={markdownUrl} />
					<ViewOptionsPopover
						markdownUrl={markdownUrl}
						githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/${path}`}
					/>
				</div>
				<DocsBody>
					<MDX components={useMDXComponents()} />
				</DocsBody>
			</DocsPage>
		);
	},
});

export async function loadDocsRoute(slugs: string[]) {
	const data = await serverLoader({ data: slugs });
	await clientLoader.preload(data.path);
	return data;
}

export type DocsRouteLoaderData = Awaited<ReturnType<typeof loadDocsRoute>>;

export function FumadocsDocsRoute({ loaderData }: { loaderData: DocsRouteLoaderData }) {
	const { path, pageTree, markdownUrl } = useFumadocsLoader(loaderData);

	return (
		<DocsLayout {...baseOptions()} tree={pageTree}>
			<Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
		</DocsLayout>
	);
}
