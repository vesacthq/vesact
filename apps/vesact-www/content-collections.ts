import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import { z } from "zod";

import { config as i18nConfig } from "../../packages/i18n/config";

function sanitizePath(path: string) {
	return path
		.replace(/(\.[a-zA-Z-]{2,5})$/, "")
		.replace(/^\//, "")
		.replace(/\/$/, "")
		.replace(/index$/, "");
}

function getLocaleFromFilePath(path: string) {
	return (
		path.match(/(\.[a-zA-Z-]{2,5})+\.(md|mdx|json)$/)?.[1]?.replace(".", "") ??
		i18nConfig.defaultLocale
	);
}

const legalPages = defineCollection({
	name: "legalPages",
	directory: "content/legal",
	include: "**/*.{mdx,md}",
	schema: z.object({
		title: z.string(),
		content: z.string(),
	}),
	// HTML at build time: the MDX runtime evaluates code with `new Function`,
	// which workerd forbids, and these pages must render without JavaScript.
	transform: async (document, context) => {
		const body = await compileMarkdown(context, document);

		return {
			...document,
			body,
			locale: getLocaleFromFilePath(document._meta.filePath),
			path: sanitizePath(document._meta.path),
		};
	},
});

export default defineConfig({
	content: [legalPages],
});
