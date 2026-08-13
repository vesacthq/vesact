import { PostContent } from "@blog/components/PostContent";
import { getPostBySlug } from "@blog/lib/posts";
import { LocaleLink, localeRedirect } from "@i18n/routing";
import { deLocalizeHref } from "@repo/i18n/routing";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { getBaseUrl } from "@shared/lib/base-url";
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

	if (!post) {
		return null;
	}

	const { title, date, authorName, authorImage, tags, image, body } = post;

	return (
		<div className="py-16 container">
			<div className="">
				<div className="mb-12">
					<LocaleLink href="/blog">&larr; {t("back")}</LocaleLink>
				</div>

				<div className="max-w-2xl mx-auto text-center">
					<h1 className="font-bold text-4xl">{title}</h1>

					<div className="mt-4 gap-6 flex items-center justify-center">
						{authorName && (
							<div className="flex items-center">
								{authorImage && (
									<div className="mr-2 size-8 relative overflow-hidden rounded-full">
										<img
											src={authorImage}
											alt={authorName}
											width={32}
											height={32}
											className="size-full object-cover object-center"
										/>
									</div>
								)}
								<div>
									<p className="font-semibold text-sm opacity-50">{authorName}</p>
								</div>
							</div>
						)}

						<div className="mr-0">
							<p className="text-sm opacity-30">
								{Intl.DateTimeFormat("en-US").format(new Date(date))}
							</p>
						</div>

						{tags && (
							<div className="gap-2 flex flex-wrap">
								{tags.map((tag) => (
									<span
										key={tag}
										className="font-semibold text-xs tracking-wider text-primary uppercase"
									>
										#{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{image && (
				<div className="mt-6 aspect-video p-4 lg:p-6 relative overflow-hidden rounded-4xl bg-primary/10">
					<img
						src={image.startsWith("http") ? image : new URL(image, getBaseUrl()).toString()}
						alt={title}
						width={1200}
						height={630}
						className="size-full rounded-xl object-cover object-center"
					/>
				</div>
			)}

			<div className="pb-8">
				<PostContent content={body} />
			</div>
		</div>
	);
}
