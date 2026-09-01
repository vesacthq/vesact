# [AGENTS.md](http://AGENTS.md)

This file applies to the whole `flint` repository.
Mirror existing conventions and prefer nearby canonical implementations.
Explicit user instructions win; if a documented command fails, report it rather than inventing a workaround.

## Stack

- TanStack Start, TanStack Router, React, TypeScript, Vite, and Node.js 22+
- pnpm workspaces, Turborepo, Nitro, oRPC, Hono, and Better Auth
- Drizzle ORM, Tailwind CSS, Shadcn-style components, and Base UI
- TanStack Form, TanStack Query, Zod 4, use-intl, Vitest, Playwright, Oxlint, and Oxfmt

## Setup & verification

### Environment

Copy `.env.local.example` to `.env.local`. For local boot, set `DATABASE_URL` to
`postgresql://postgres:postgres@localhost:5432/flint`, set `BETTER_AUTH_SECRET`,
and keep the local `VITE_*` URLs from the example. OAuth, mail, payments, storage,
and AI variables are only needed when using those integrations.

Start the local services with:

```bash
docker compose up -d postgres
```

The `postgres` service is PostgreSQL 16 on port 5432. The compose file also defines
MinIO (`minio` and `minio-setup`) for S3-compatible storage when storage features are used.

### Install and run

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the workspace dev tasks through Turbo.

### Root commands

| Command                             | Purpose                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                          | Start development tasks                                      |
| `pnpm build`                        | Build the workspace                                          |
| `pnpm start`                        | Start built applications                                     |
| `pnpm lint` / `pnpm lint:fix`       | Check / fix Oxlint issues                                    |
| `pnpm format` / `pnpm format:check` | Write / check Oxfmt formatting                               |
| `pnpm type-check`                   | Run workspace type checks                                    |
| `pnpm test`                         | Run Vitest workspace tests                                   |
| `pnpm verify`                       | Generate marketing content, then run Oxlint and Oxfmt checks |
| `pnpm check`                        | Apply Oxlint and Oxfmt fixes                                 |
| `pnpm clean`                        | Clear Turbo outputs                                          |

Required gates:

1. After every meaningful change, run `pnpm format` and `pnpm lint`.
2. Before every commit, run `pnpm type-check`.
3. Run the relevant tests before considering the change complete.

The root test task runs Vitest in `apps/saas` and `packages/api`.
Playwright tests are in `apps/marketing/tests` and `apps/saas/e2e`. E2E scripts
are per app: use `pnpm --filter marketing e2e`, `pnpm --filter marketing e2e:ci`,
`pnpm --filter saas e2e`, or `pnpm --filter saas e2e:ci`. E2E requires a running
application and database.

## Monorepo map

```text
apps/
├── docs/          # TanStack Start/Fumadocs documentation
├── mail-preview/  # React Email preview
├── marketing/     # Public site, blog, and content
└── saas/          # Authenticated product
packages/
├── ai/
├── api/
├── auth/
├── database/
├── i18n/
├── logs/
├── mail/
├── notifications/
├── payments/
├── permissions/ # Permix definitions + rule builder
├── storage/
├── ui/
└── utils/
tooling/
├── scripts/
├── tailwind/
└── typescript/
```

## Imports & path aliases

`@repo/*` and `@repo/ui/*` are pnpm workspace package names. They are not
TypeScript, Vite, or TanStack path mappings. Use package exports such as
`@repo/auth`, `@repo/database`, and `@repo/ui/components/button`.

Only app-local aliases are configured in the app `tsconfig.json` files.

### `apps/saas/tsconfig.json`

| Alias              | Target                      |
| ------------------ | --------------------------- |
| `@config`          | `./config`                  |
| `@auth/*`          | `./modules/auth/*`          |
| `@organizations/*` | `./modules/organizations/*` |
| `@settings/*`      | `./modules/settings/*`      |
| `@payments/*`      | `./modules/payments/*`      |
| `@i18n/*`          | `./modules/i18n/*`          |
| `@admin/*`         | `./modules/admin/*`         |
| `@ai/*`            | `./modules/ai/*`            |
| `@onboarding/*`    | `./modules/onboarding/*`    |
| `@shared/*`        | `./modules/shared/*`        |

### `apps/marketing/tsconfig.json`

| Alias                 | Target                             |
| --------------------- | ---------------------------------- |
| `@config`             | `./config`                         |
| `@analytics`          | `./modules/analytics`              |
| `@home/*`             | `./modules/home/*`                 |
| `@blog/*`             | `./modules/blog/*`                 |
| `@i18n/*`             | `./modules/i18n/*`                 |
| `@changelog/*`        | `./modules/changelog/*`            |
| `@legal/*`            | `./modules/legal/*`                |
| `@shared/*`           | `./modules/shared/*`               |
| `content-collections` | `./.content-collections/generated` |

## API & data layer

oRPC modules live under `packages/api/modules`. Procedures use `publicProcedure`,
`protectedProcedure`, or `adminProcedure`, with route metadata, Zod input validation,
middleware, and a handler. Follow `packages/api/modules/organizations/procedures/`.

Drizzle is the only ORM. Change the schema under `packages/database/drizzle/schema/`
and use the database package scripts:

```bash
pnpm --filter @repo/database push
pnpm --filter @repo/database generate
pnpm --filter @repo/database migrate
pnpm --filter @repo/database studio
```

Do not hand-edit generated Drizzle migration files or route trees:
`apps/marketing/routeTree.gen.ts`, `apps/saas/routeTree.gen.ts`, and
`apps/docs/src/routeTree.gen.ts` are generated. Marketing content collections under
`apps/marketing/.content-collections/` are also generated.

### Notifications

Create server-side notifications with `createNotification` from
`packages/notifications/src/create-notification.ts`. Types and kinds live in
`packages/notifications/src/types.ts`, and the settings catalog lives in
`packages/notifications/src/catalog.ts`; keep the database enum, catalog, and i18n labels in sync.

For client data fetching, use the oRPC helpers in
`apps/saas/modules/shared/lib/orpc-query-utils.ts` with TanStack Query.

### Client cache invalidation

After every successful mutation that affects a list or detail query—whether
oRPC, `authClient`, or any other write—invalidate the matching TanStack Query
keys before showing success UI. Do not rely on a full page reload.

- Prefer `queryClient.invalidateQueries({ queryKey: orpc.<module>.list.key() })`
  for oRPC lists. Prefix keys refresh every filtered/paginated page.
- For non-oRPC lists, invalidate the same key the list query uses (for example
  `organizationListQueryKey`, `userPasskeyQueryKey`, `["active-sessions"]`).
- When one mutation changes multiple cached views, invalidate every affected key
  (admin org CRUD also refreshes `organizationListQueryKey`; member leave
  refreshes both the members query and the org switcher list).
- Canonical examples: admin user delete in
  `apps/saas/modules/admin/components/users/UserList.tsx`, invitation revoke in
  `OrganizationInvitationsList.tsx`, and passkey CRUD in `PasskeysBlock.tsx`.

## Framework patterns

- TanStack Start does not use React Server Components or `"use client"`.
- Do not import from `next/*`, `next/navigation`, or other Next.js APIs.
- Use TanStack Router route loaders and `createServerFn` for server-side work.
- Use `throw redirect()` and `throw notFound()` from `@tanstack/react-router`.
- Follow the auth guard in `apps/saas/routes/_authenticated/route.tsx`.

## Auth & multi-tenancy

- Server sessions use `getSession` from `@auth/lib/auth-server.server`.
- Client session state uses `useSession` from `@auth/hooks/use-session`.
- Scope organization data with the active organization helpers under
  `apps/saas/modules/organizations`.
- When changing auth flows, update relevant templates under `packages/mail/emails`,
  preserve audit hooks, and verify locale handling.

Canonical auth example:
`apps/saas/modules/auth/lib/auth-server.server.ts`.

## Permissions (Permix)

- Definitions and rule builder: `@repo/permissions` (`createPermissionRules`,
  `checkPermission`, `PermissionsDefinition`).
- oRPC: `packages/api/orpc/permix.ts` + permissions attached in
  `packages/api/orpc/procedures.ts`.
- SaaS server: `apps/saas/start.ts` (app-root `start.ts` because
  `srcDirectory: "."`) registers Permix via `createMiddleware().server(...)`
  so server-only auth/DB imports are stripped from the client graph. Shared
  helpers live in `apps/saas/modules/shared/lib/permix.ts`.
- Router context + hydrate in `apps/saas/routes/__root.tsx` via
  `get-permix-state.ts` (`createServerFn`, not a `*.server.*` module);
  client `PermixProvider` / `usePermissions()`.
- Prefer `checkPermission(...)` / `usePermissions().check(...)` over
  `isOrganizationAdmin` and inline `role === "..."` comparisons. Keep
  `@repo/auth/lib/helper` wrappers only for backwards compatibility.
- For user-scoped gates like `admin.access`, prefer `checkPermission({ user })`
  over `permix.getOrThrow(context).check(...)` so the gate does not depend on
  request-middleware setup having completed.
- Better Auth `organization.*` client endpoints are not covered by Permix.

## UI, forms, and i18n

- Use components from `@repo/ui/components`; compose with Base UI primitives.
- Use `@tanstack/react-form` with Zod. Follow
  `apps/marketing/modules/home/components/ContactForm.tsx`.
- Use `useTranslations`, `useFormatter`, and `IntlProvider` from `use-intl`.
  Follow `apps/saas/modules/i18n/provider.tsx`.
- Locale helpers and the `locale` cookie are configured in `packages/i18n/config.ts`.
- Document titles use `documentTitle()` from `@shared/lib/document-title`
  (`{page} – ${config.appName}`, en dash). Call it from every SaaS route `head()`.
  Routes without a page title (marketing homepage) keep `config.appName` alone.

## Config & environment variables

Keep server-only variables unprefixed. Browser-visible variables use `VITE_`.
Use `.env.local` for local secrets and never commit it. Vite app configuration
uses the monorepo root as its environment directory.

## Dependencies & supply chain

`pnpm-workspace.yaml` sets `minimumReleaseAge: 1440`; installing a release younger
than 24 hours can fail. Use existing `catalog:` versions where available and add
dependencies to the workspace package that imports them.

## Change management

- Use conventional commits such as `feat:`, `fix:`, `docs:`, or `refactor:`.
- Update `CHANGELOG.md` for consumer-impacting changes.
- Update relevant docs under `apps/marketing/content` for user-facing behavior.
- Update `AGENTS.md` when conventions, aliases, scripts, or app boundaries change.
- Supastarter ships three starter kits. Keep changes generic and consider whether
  an equivalent update belongs in the Next.js or Nuxt kit.

## Before you're done

- [ ] `pnpm format` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] Relevant tests pass
- [ ] No `console.log` statements were added
- [ ] No unjustified `any` types were added
- [ ] User-facing strings have translations
- [ ] Relevant docs and `CHANGELOG.md` are updated

More documentation: [https://supastarter.dev/docs/tanstack-start](https://supastarter.dev/docs/tanstack-start)
