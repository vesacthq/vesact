---
name: update-the-docs
description: "Use when updating repository-owned Fumadocs content or preparing an explicit handoff for Supastarter documentation maintained outside this repository."
---

# Update the docs

## Scope

Use for documentation affected by code changes. Do not assume the public `supastarter.dev/docs` source exists in this checkout.

## Procedure

1. Classify ownership before editing:
   - Starter-local docs UI/content: `apps/docs/`.
   - Public marketing copy/blog/legal content: `apps/marketing/content/`.
   - Supastarter product documentation hosted from another repository: prepare an out-of-repo handoff with page, required wording, links, and code references; do not invent a local path.
2. For local Fumadocs pages, edit MDX under `apps/docs/content/`. `apps/docs/source.config.ts` defines `docs` from that directory; follow `apps/docs/content/index.mdx`. This checkout currently has no content-tree metadata file, so do not invent one.
3. Update navigation metadata only when a corresponding metadata file actually exists.
4. Keep code samples accurate for TanStack Start: `createFileRoute`, `createServerFn`, TanStack Form/Query, Drizzle scripts, root `.env.local`, and `VITE_` browser variables.
5. Generate Fumadocs output and type-check using the actual (intentionally named) script, then build:
   ```bash
   pnpm --filter docs types:check
   pnpm --filter docs build
   ```
6. Verify internal links and rendered MDX. `types:check` runs `fumadocs-mdx && tsc --noEmit`; never edit generated `apps/docs/src/routeTree.gen.ts`.
7. When docs are out-of-repo, include the owning external page URL/topic and exact changes in the handoff; leave this repository unchanged except for code comments/readme material that truly belongs here.

Canonical references: `apps/docs/source.config.ts`, `apps/docs/content/index.mdx`, and `apps/docs/package.json`.

## Done

- Correct ownership is established and local edits or external handoff cover the behavior change.
- Local Fumadocs type-check/build and link review pass when applicable.

## Common mistakes

- Treating `apps/marketing/content/posts` as product documentation.
- Inventing a local directory for an external docs repository.
- Running `pnpm --filter docs type-check`; the current script is `types:check`.
- Writing Next.js/RSC examples for this TanStack Start kit.
- Hand-editing generated docs route trees.
