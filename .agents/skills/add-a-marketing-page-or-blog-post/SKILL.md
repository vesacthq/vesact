---
name: add-a-marketing-page-or-blog-post
description: "Use when adding a TanStack Router marketing page or localized MDX blog/legal content backed by Content Collections."
---

# Add a marketing page or blog post

## Scope

Use for public marketing routes and repository-owned blog/legal content. Do not place product documentation here or edit generated content collections.

## Procedure

1. For a page, add a file route under `apps/marketing/routes/` using `createFileRoute`; put feature UI under `apps/marketing/modules/<feature>/`. Use `head()` with `createTranslatorForLocale(getCurrentLocale(), "marketing")` for localized metadata.
2. For a blog post, add `apps/marketing/content/posts/<slug>.mdx`. Match the schema in `apps/marketing/content-collections.ts`: `title`, `date`, optional image/author links, `authorName`, optional `excerpt`, `tags`, and `published`.
3. Add optional localized variants as `<slug>.<locale>.mdx`; `apps/marketing/content-collections.ts` extracts locale from the filename and blog lookup falls back to the default locale. Legal pages live under `apps/marketing/content/legal/`.
4. Add UI keys to all marketing locale files and use `LocaleLink`/routing helpers. When a new static page belongs in discovery, add it to `staticMarketingPages` in `apps/marketing/routes/sitemap[.]xml.ts`; posts/legal content are included automatically.
5. Generate content and route types:
   ```bash
   pnpm --filter marketing generate
   pnpm --filter marketing type-check
   ```
6. Never edit `apps/marketing/.content-collections/` or `apps/marketing/routeTree.gen.ts`; Vite/TanStack tooling regenerates them.
7. Add/update Playwright coverage under `apps/marketing/tests/` and run:
   ```bash
   pnpm --filter marketing e2e:ci
   pnpm --filter marketing build
   ```

Canonical references: `apps/marketing/routes/contact/index.tsx`, `apps/marketing/content-collections.ts`, `apps/marketing/content/posts/first-post.mdx`, `apps/marketing/modules/blog/lib/posts.ts`, and `apps/marketing/routes/sitemap[.]xml.ts`.

## Done

- Route/content schema, fallback behavior, localized metadata/copy, navigation, generated outputs, and sitemap are correct.
- Marketing generate, type-check, build, and relevant E2E pass.

## Common mistakes

- Adding frontmatter fields not accepted by `apps/marketing/content-collections.ts`.
- Creating translated content without the `.<locale>.mdx` filename convention.
- Adding a static route without considering `staticMarketingPages` in the sitemap route.
- Editing `.content-collections/generated` or `routeTree.gen.ts`.
- Using Next.js page/layout or metadata APIs instead of TanStack Router `createFileRoute` and `head`.
