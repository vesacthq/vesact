---
name: add-a-ui-component
description: "Use when adding a reusable Shadcn-style React component or Base UI wrapper to the shared UI workspace."
---

# Add a UI component

## Scope

Use for reusable, app-agnostic primitives in `packages/ui`. Do not move feature components, data fetching, routing, or translations into the UI package.

## Registry installs (shadcn / @reui)

Prefer installing from a registry over hand-writing when an official or ReUI item exists.

1. Run from `packages/ui`: `pnpm dlx shadcn@latest add <name>` (or `@reui/<name>`; the `@reui` registry and its auth are configured in `components.json`). Never pass `--overwrite` by default; when the CLI prompts about an existing file, answer no and resolve deliberately (`yes n | pnpm dlx shadcn@latest add ... --yes` for non-interactive runs).
2. Audit CLI side effects with `git status` and `git diff` before anything else. Known offenders, all to roll back unless intended:
   - `tooling/tailwind/theme.css`: the CLI rewrites theme tokens to upstream defaults.
   - `packages/ui/package.json`: the CLI pins versions that should stay `catalog:` and adds dependencies the code may not need after adaptation.
   - Existing components overwritten as dependencies of the installed item.
3. Post-process every installed file:
   - Rewrite `@/` alias imports to relative paths (`@/lib/index` → `../lib`); app tsconfigs compile `packages/ui` sources directly and do not resolve the `@/*` alias.
   - Remove `"use client"` directives.
   - Replace Next.js-isms with repo equivalents: `next-themes` → `components/theme-provider.tsx` (`useTheme`), `next/link` and `next/navigation` → TanStack Router.
4. Map variants faithfully: when the official item has a variant matching the previous look (for example `TabsList variant="line"`), use it instead of accepting the default.
5. Continue with the verification steps below.

## Procedure

1. Search `packages/ui/components/` for an existing primitive or composition before creating one.
2. Add `packages/ui/components/<name>.tsx`; use React, Tailwind tokens from `tooling/tailwind/theme.css`, `cn()` from `packages/ui/lib`, and `@base-ui/react` for accessible interaction primitives.
3. Mirror local composition: expose controlled props, forward refs where the native element requires them, preserve keyboard/focus behavior, and accept `className`.
4. Compose links/triggers with the Base UI-style `render` prop. The repository does not use Radix `asChild`.
5. Export from `packages/ui/index.ts` for barrel access; consumers commonly use direct subpaths such as `@repo/ui/components/button`.
6. Keep the primitive app-agnostic: accept accessible labels/content as props rather than importing app translations, router APIs, Query, or oRPC.
7. Exercise loading, disabled, error, focus-visible, keyboard, dark theme, and narrow viewport states in a consuming app.
8. `@repo/ui` has no `test` script. Add behavior coverage in an owning Vitest workspace or feature Playwright flow unless the package gains an intentional test setup.
9. Run:
   ```bash
   pnpm --filter @repo/ui type-check
   pnpm format
   pnpm lint
   pnpm type-check
   ```
   Also run affected app E2E for interactive/user-visible changes.

Canonical references: `packages/ui/components/button.tsx` implements variants and `render` composition (loading states compose `Spinner` with `disabled` at call sites); `packages/ui/components/dialog.tsx` wraps Base UI primitives.

## Done

- API, accessibility, theme tokens, exports, and consuming usage match existing components.
- UI/root type-check and relevant browser coverage pass; keyboard/focus behavior is verified.

## Common mistakes

- Adding `"use client"`; TanStack Start does not use the RSC boundary.
- Copying Radix `asChild` examples instead of the `render` composition API.
- Leaving `@/` alias imports or `"use client"` in installed registry files; both break app type-checks or are dead weight in TanStack Start.
- Embedding feature translations, router links, or API calls in a shared primitive.
- Assuming Turbo runs UI unit tests when `packages/ui/package.json` defines no test task.
