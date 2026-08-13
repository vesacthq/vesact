import { PostContent } from "@blog/components/PostContent";
import { localeRedirect } from "@i18n/routing";
import { getLegalPageByPath } from "@legal/lib/pages";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { getActivePathFromUrlParam } from "@shared/lib/content";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal/$slug/")({
	component: LegalPage,
	loader: async ({ params }) => {
		const resolvedLocale = getCurrentLocale();
		const activePath = getActivePathFromUrlParam(params.slug);
		const page = await getLegalPageByPath(activePath, { locale: resolvedLocale });
		if (!page) {
			localeRedirect({ href: "/" });
		}
		return { page };
	},
	head: ({ loaderData }) => ({
		meta: loaderData?.page ? [{ title: documentTitle(loaderData.page.title) }] : [],
	}),
});

function LegalPage() {
	const { page } = Route.useLoaderData();

	if (!page) {
		return null;
	}

	const { title, body } = page;

	return (
		<div className="max-w-3xl py-20 lg:py-28 container">
			<div className="mb-12">
				<h1 className="font-medium text-3xl md:text-4xl lg:text-[2.875rem] tracking-tight leading-[1.12] text-pretty">
					{title}
				</h1>
			</div>

			<PostContent content={body} />
		</div>
	);
}
