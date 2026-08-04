---
name: add-auth-flow-or-better-auth-plugin
description: "Use when extending Better Auth server/client plugins, auth routes, session fields, email hooks, or sign-in flows."
---

# Add an auth flow or Better Auth plugin

## Scope

Use for authentication, account, session, and Better Auth plugin behavior. Do not implement general authorization here; organization/resource access still belongs at each data/API boundary.

## Procedure

1. Read `packages/auth/auth.ts`, `packages/auth/client.ts`, and `packages/auth/config.ts`; map server plugin, matching client plugin, schema fields, callbacks/hooks, error codes, and feature flags.
2. Add server configuration/plugin to `packages/auth/auth.ts`. Put a custom plugin under `packages/auth/plugins/<plugin>/index.ts` and type it with `BetterAuthPlugin`.
3. Register the corresponding client plugin in `packages/auth/client.ts` when the feature has browser APIs. Extend exported error codes/types instead of casting across the UI.
4. Apply required fields/tables to active PostgreSQL `packages/database/drizzle/schema/postgres.ts`, update Zod/queries if consumed, and generate a migration. `packages/auth/auth.ts` currently uses `drizzleAdapter(db, { provider: "pg" })`.
5. Add/update file routes under `apps/saas/routes/` with `createFileRoute`. Wrap server session/loading work in `createServerFn`; `getSession()` in `apps/saas/modules/auth/lib/auth-server.server.ts` reads TanStack Start request headers.
6. Build forms with `@tanstack/react-form`, call `authClient`, and refresh session state through `sessionQueryKey` invalidation or `reloadSession()` from `useSession()` after mutations.
7. Update localized strings and React Email templates/hooks when verification, reset, magic-link, or invitation behavior changes.
8. Preserve audit/payment hooks in `packages/auth/auth.ts`, trusted-origin validation, locale extraction, and safe redirect handling.
9. Add unit coverage for callbacks/errors/safe redirects and Playwright coverage for changed UI. Run focused tests, `pnpm --filter saas e2e:ci`, lint, type-check, and build.

Canonical references: `packages/auth/auth.ts`, `packages/auth/client.ts`, `packages/auth/plugins/invitation-only/index.ts`, `apps/saas/modules/auth/components/LoginForm.tsx`, `apps/saas/modules/auth/lib/auth-server.server.ts`, and `apps/saas/routes/login/index.tsx`.

## Done

- Server/client plugin registration, schema, routes, UI, errors, mail, and locale handling are synchronized.
- Session refresh and safe redirects are verified.
- Auth tests and login E2E pass.

## Common mistakes

- Adding only the server plugin and omitting its client companion.
- Using client session data as authorization proof.
- Importing `next/*`, adding `"use client"`, or expecting Server Actions.
- Dropping existing hooks that cancel subscriptions, update seats, or send localized mail.
- Adding auth UI without updating feature flags, error translations, and session invalidation together.
