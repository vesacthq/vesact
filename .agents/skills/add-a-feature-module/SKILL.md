---
name: add-a-feature-module
description: "Use when introducing a cohesive SaaS or marketing feature module with TanStack Router routes, Form state, Query state, and local aliases."
---

# Add a feature module

## Scope

Use when behavior needs multiple components, hooks/lib code, and routes. Do not create a module for a single reusable primitive or a package that must be shared across apps.

## Procedure

1. Choose the owning app and create `apps/saas/modules/<feature>/` or `apps/marketing/modules/<feature>/` with only needed `components/`, `hooks/`, and `lib/` directories.
2. Add an app-local alias such as `"@feature/*": ["./modules/feature/*"]` to that app's `tsconfig.json` only when several files need it. `@repo/*` names are workspace packages, not aliases.
3. Add file routes under the owning app's `routes/` tree with `createFileRoute`. Use route `loader`/`beforeLoad` for loading/guards, `throw redirect()`/`throw notFound()` for control flow, and `createServerFn` for server-only work.
4. Keep async client state in TanStack Query (prefer oRPC query/mutation options) and forms in `@tanstack/react-form`.
5. Add navigation in the owning shell when required, such as `apps/saas/modules/shared/components/NavBar.tsx`, and translate every label. When adding an account-level top-level route under `apps/saas/routes/_authenticated/_main/`, append its slug to `organizations.forbiddenOrganizationSlugs` in `packages/auth/config.ts` so it cannot collide with an organization slug.
6. Keep shared persistence/API behavior in `packages/database` and `packages/api`; do not import server-only modules into browser components.
7. Let the TanStack Router Vite plugin regenerate `routeTree.gen.ts` during dev/build; never edit it. Run the owning app:
   ```bash
   pnpm --filter saas type-check
   pnpm --filter saas build
   # Or replace `saas` with `marketing`.
   ```
8. Run focused tests plus `pnpm format`, `pnpm lint`, and `pnpm type-check`.

Canonical references: `apps/saas/modules/payments/` with `apps/saas/routes/_authenticated/_main/settings/billing/index.tsx`; `apps/marketing/modules/blog/` with `apps/marketing/routes/blog/`; and both app `tsconfig.json` files.

## Done

- Ownership, aliases, routes, navigation, API/data boundaries, and translations are complete.
- Generated route trees were regenerated, not hand-edited.
- Formatting, lint, type-check, and relevant Vitest/Playwright coverage pass.

## Common mistakes

- Adding `"use client"` or React Server Component assumptions; TanStack Start uses neither.
- Copying Next.js `app/` routing or Server Actions.
- Putting app-specific code in `packages/ui`.
- Creating an alias in Vite config when app aliases belong in `tsconfig.json`.
- Expecting `tsc --noEmit` alone to regenerate a route tree; route generation is a Vite plugin concern.
- Adding a top-level account route without reserving its slug from organization URLs.
