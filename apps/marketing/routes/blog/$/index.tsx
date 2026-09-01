import { PostContent } from "@blog/components/PostContent";
import { PostTagLink } from "@blog/components/PostTagLink";
import { getPostBySlug } from "@blog/lib/posts";
import { LocaleLink, localeRedirect } from "@i18n/routing";
import { deLocalizeHref } from "@repo/i18n/routing";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { getActivePathFromUrlParam } from "@shared/lib/content";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

export const Route = createFileRoute("/blog/$/")({
	component: BlogPostPage,
	loader: async ({ location }) => {
		const resolvedLocale = getCurrentLocale();
		const dePath = deLocalizeHref(location.pathname);
		const slug = getActivePathFromUrlParam(dePath.replace(/^\/blog\/?/, "").replace(/\/$/, ""));
		const post = await getPostBySlug(slug, { locale: resolvedLocale });
		if (!post) {
			localeRedirect({ href: "/blog" });
		}
		return { post };
	},
	head: ({ loaderData }) => ({
		meta: loaderData?.post
			? [
					{ title: documentTitle(loaderData.post.title) },
					{ name: "description", content: loaderData.post.excerpt ?? "" },
				]
			: [],
	}),
});

function BlogPostPage() {
	const { post } = Route.useLoaderData();
	const t = useTranslations("blog");
	const locale = getCurrentLocale();

	if (!post) {
		return null;
	}

	const { title, date, authorName, authorImage, tags, image, body } = post;

	return (
		<div className="py-20 md:py-24 lg:py-28 lg:pb-40 container">
			<div className="mb-10">
				<LocaleLink
					href="/blog"
					className="text-sm text-foreground/50 transition-colors hover:text-primary"
				>
					&larr; {t("back")}
				</LocaleLink>
			</div>

			<div className="max-w-2xl">
				<h1 className="font-medium text-3xl md:text-4xl lg:text-[2.875rem] tracking-tight leading-[1.12] text-pretty text-foreground">
					{title}
				</h1>

				<div className="mt-5 gap-4 text-sm flex flex-wrap items-center text-foreground/50">
					{authorName && (
						<div className="gap-2 flex items-center">
							{authorImage && (
								<div className="size-7 relative overflow-hidden rounded-full">
									<img
										src={authorImage}
										alt={authorName}
										className="size-full object-cover object-center"
									/>
								</div>
							)}
							<span>{authorName}</span>
						</div>
					)}

					<span>{Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(date))}</span>

					{tags && (
						<div className="gap-2 flex flex-wrap">
							{tags.map((tag) => (
								<PostTagLink key={tag} tag={tag} />
							))}
						</div>
					)}
				</div>
			</div>

			{image && (
				<div className="mt-10 max-w-3xl aspect-video relative overflow-hidden rounded-xl border border-border/60">
					<img src={image} alt={title} className="size-full object-cover object-center" />
				</div>
			)}

			<div className="pb-8">
				<PostContent content={body} />
			</div>
		</div>
	);
}
