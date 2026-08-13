import { PostListItem } from "@blog/components/PostListItem";
import { getAllPosts } from "@blog/lib/posts";
import { createTranslatorForLocale } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

export const Route = createFileRoute("/blog/")({
	component: BlogListPage,
	loader: async () => ({
		posts: await getAllPosts(getCurrentLocale()),
	}),
	head: () => {
		const t = createTranslatorForLocale(getCurrentLocale(), "marketing");
		return {
			meta: [{ title: documentTitle(t("blog.title")) }],
		};
	},
});

function BlogListPage() {
	const { posts } = Route.useLoaderData();
	const t = useTranslations("blog");

	return (
		<div className="max-w-6xl py-16 container">
			<div className="mb-12 pt-8 text-center">
				<h1 className="mb-2 font-bold text-5xl">{t("title")}</h1>
				<p className="text-lg opacity-50">{t("description")}</p>
			</div>

			<div className="gap-8 md:grid-cols-2 grid">
				{posts.map((post) => (
					<PostListItem post={post} key={post.path} />
				))}
			</div>
		</div>
	);
}
