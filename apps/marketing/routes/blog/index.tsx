import { PostListItem } from "@blog/components/PostListItem";
import { PostTagFilter } from "@blog/components/PostTagFilter";
import { getAllPosts } from "@blog/lib/posts";
import { filterPostsByTag, getTagFromSearchParam, getUniquePostTags } from "@blog/lib/tags";
import { SectionHeader } from "@home/components/SectionHeader";
import { createTranslatorForLocale } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

type BlogSearch = {
	tag?: string;
};

export const Route = createFileRoute("/blog/")({
	component: BlogListPage,
	validateSearch: (search: Record<string, unknown>): BlogSearch => ({
		tag: typeof search.tag === "string" ? search.tag : undefined,
	}),
	loader: async () => ({
		posts: await getAllPosts(getCurrentLocale()),
	}),
	head: () => {
		const t = createTranslatorForLocale(getCurrentLocale(), "marketing");
		return {
			meta: [{ title: t("blog.title") }],
		};
	},
});

function BlogListPage() {
	const { posts: allPosts } = Route.useLoaderData();
	const { tag } = Route.useSearch();
	const t = useTranslations("blog");
	const activeTag = getTagFromSearchParam(tag);
	const posts = filterPostsByTag(allPosts, activeTag);
	const tags = getUniquePostTags(allPosts);

	return (
		<div className="py-20 md:py-24 lg:py-28 lg:pb-40">
			<div className="container">
				<SectionHeader
					titleAs="h1"
					eyebrow={t("badge")}
					title={t("title")}
					description={t("description")}
				/>

				<PostTagFilter
					tags={tags}
					activeTag={activeTag}
					label={t("filterLabel")}
					allLabel={t("allTags")}
				/>

				{posts.length > 0 ? (
					<div className="flex flex-col divide-y divide-border/60">
						{posts.map((post) => (
							<PostListItem post={post} activeTag={activeTag} key={post.path} />
						))}
					</div>
				) : (
					<p className="text-base leading-relaxed text-foreground/55" data-test="blog-empty-filter">
						{t("emptyFilter")}
					</p>
				)}
			</div>
		</div>
	);
}
