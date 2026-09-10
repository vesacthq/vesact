---
name: update-the-docs
description: "Use when a change affects documentation: repository conventions, product vocabulary, decisions, Relay developer docs, or public marketing and legal content."
---

# Update the docs

## Where each kind of documentation lives

| Content                                         | File                                 | Owner of the wording                                        |
| ----------------------------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| Conventions, environments, commands, aliases    | `AGENTS.md`                          | whoever changes the convention                              |
| Studio vocabulary, architecture, site map       | `docs/studio/*.wip.md`               | product; ask before changing a term or the scope            |
| Relay overview                                  | `docs/relay/overview.md`             | product                                                     |
| Account center: scope, routes, navigation rules | `docs/account/overview.md`           | product                                                     |
| Relay milestone specs, with acceptance          | `docs/relay/skeleton.md`             | engineering; the issue tracks progress, the doc the scope   |
| Platform facts, research conclusions            | `docs/reference/*.md`                | whoever verified the fact                                   |
| Decisions                                       | `docs/decisions.md`                  | append one dated entry: conclusion and reason, newest first |
| Relay developer docs                            | `apps/docs/content/*.mdx` (Fumadocs) | engineering                                                 |
| Public copy, legal pages                        | `apps/marketing/content/`            | product; legal pages are also platform-review material      |

## Procedure

1. Pick the file from the table. A convention that changed means `AGENTS.md`;
   a choice between alternatives means `docs/decisions.md`; a user-visible
   behaviour means marketing content.
2. A `.wip.md` suffix means a draft: correct a term or a fact, do not restructure.
   Finalising a draft means renaming it without the suffix and fixing references.
3. For `apps/docs`, edit MDX under `apps/docs/content/`, then run
   `pnpm --filter docs types:check` and `pnpm --filter docs build`. Never edit
   `apps/docs/src/routeTree.gen.ts`.
4. Run `pnpm format` before finishing; it formats Markdown tables.

## Common mistakes

- Recording a decision inside `AGENTS.md` instead of `docs/decisions.md`.
- Treating `apps/marketing/content` as product documentation.
- Writing Next.js or RSC examples; this is TanStack Start.
