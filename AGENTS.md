# [AGENTS.md](http://AGENTS.md)

This file applies to the whole `vesact` repository.
Mirror existing conventions and prefer nearby canonical implementations.
Explicit user instructions win; if a documented command fails, report it rather than inventing a workaround.

## Product context

Studio (`apps/studio`) is the first product; Relay, an API platform, is planned
as the second. `docs/studio/` holds Studio's vocabulary, architecture and site map,
`docs/account/` the account center (identity, profile, organizations, members, billing), `docs/relay/` Relay's overview, engineering design, milestone specs and messaging domain, `docs/reference/` platform facts and research
conclusions, `docs/decisions.md` the decision log. A `.wip.md` suffix means a
draft: use its terms, but do not derive schemas or plans from it without asking.

Work is tracked in GitHub issues. The `deferred` label means "no start date; do
it when the trigger in the first line of the issue is met".

## Stack

- TanStack Start, TanStack Router, React, TypeScript, Vite, and Node.js 22+
- pnpm workspaces, Turborepo, Nitro, oRPC, Hono, and Better Auth
- Drizzle ORM, Tailwind CSS, shadcn/ui (base-vega registry), and Base UI
- TanStack Form, TanStack Query, Zod 4, use-intl, Vitest, Playwright, Oxlint, and Oxfmt

## Setup & verification

### Environment

Secrets are committed encrypted under `secrets/` with sops + age; `.sops.yaml`
lists the recipients. Outside the repository there are two GitHub secrets:
`SOPS_AGE_KEY`, CI's age private key, and `TURBO_TOKEN` for the remote cache
(`validate-prs.yml` never decrypts anything). Your own age key is
`~/.config/sops/age/keys.txt`; keep a copy in the password manager, because
without it every secret has to be re-entered. Adding a person means adding
their age public key to `.sops.yaml` and running `sops updatekeys secrets/*.env`;
rotating CI's key means a new `age-keygen`, `gh secret set SOPS_AGE_KEY`, then
the same `updatekeys`.

| File                           | Reaches                                              |
| ------------------------------ | ---------------------------------------------------- |
| `secrets/ci.env`               | GitHub Actions: Cloudflare, Turbo, Neon, Access      |
| `secrets/account.<target>.env` | The account Worker: Better Auth secret, Google, mail |
| `secrets/database.<env>.env`   | `DATABASE_URL` for migrations, prod and preview      |
| `secrets/studio.<env>.env`     | Worker secrets, synced on every deploy               |
| `secrets/studio.dev.env`       | `apps/studio/.dev.vars` via `pnpm secrets:pull`      |

Edit with `sops secrets/<file>.env`; never commit a decrypted file.

Local configuration reaches two runtimes. `.env.local` (copy it from
`.env.local.example`) feeds the Vite build and the Node-side scripts: `DATABASE_URL`
for `pnpm --filter @repo/database push | generate | migrate | studio`, and the
`VITE_*` URLs inlined into the client bundle. `apps/studio/.dev.vars` (from
`pnpm secrets:pull`) is what the Worker reads at runtime; `.env.local` never
reaches it. Without `.dev.vars` the local server sees `wrangler.jsonc` `vars`,
which hold production values, and derives Better Auth's `baseURL`, the OAuth
callbacks, the trusted origins and the links in email from them. The app's own
database connection comes from the Hyperdrive binding's `localConnectionString`,
not from `DATABASE_URL`.

Mail, payments, storage, and AI variables are only needed when using those
integrations.

Start the local services with:

```bash
docker compose up -d postgres
```

The `postgres` service is PostgreSQL 16, published on host port 5433. The compose file also defines
MinIO (`minio` and `minio-setup`) for S3-compatible storage when storage features are used.

### Install and run

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the workspace dev tasks through Turbo.

### Running locally

`pnpm dev` starts studio on 3000, marketing on 3001, docs on 3002, account on 3004 and the mail
preview on 3003. A fresh database has no seed data: register the first account
through the sign-up page. `push` applies the schema to the local database and
`studio` opens Drizzle Studio against it. Analytics stays off locally
(`import.meta.env.PROD` gates it). MinIO only matters for uploads:
`docker compose up -d minio minio-setup`.

Playwright starts its own dev server on 3100 and fails with `already used` when
a stray server holds the port; reuse one only with `PW_REUSE_SERVER=1`.

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

The root test task runs Vitest in `apps/studio` and `packages/api`.
Playwright tests are in `apps/marketing/tests` and `apps/studio/e2e`. E2E scripts
are per app: use `pnpm --filter marketing e2e`, `pnpm --filter marketing e2e:ci`,
`pnpm --filter studio e2e`, or `pnpm --filter studio e2e:ci`. E2E requires a running
application and database.

## Monorepo map

```text
apps/
├── account/       # Account center: login, profile, organizations, billing; serves Better Auth
├── docs/          # TanStack Start/Fumadocs documentation
├── mail-preview/  # React Email preview
├── marketing/     # Public site, blog, and content
└── studio/          # Authenticated product
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

### `apps/studio/tsconfig.json`

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

### `apps/account/tsconfig.json`

| Alias        | Target                |
| ------------ | --------------------- |
| `@config`    | `./config`            |
| `@auth/*`    | `./modules/auth/*`    |
| `@account/*` | `./modules/account/*` |
| `@i18n/*`    | `./modules/i18n/*`    |
| `@shared/*`  | `./modules/shared/*`  |

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
`apps/marketing/routeTree.gen.ts`, `apps/studio/routeTree.gen.ts`, and
`apps/docs/src/routeTree.gen.ts` are generated. Marketing content collections under
`apps/marketing/.content-collections/` are also generated.

### Notifications

Create server-side notifications with `createNotification` from
`packages/notifications/src/create-notification.ts`. Types and kinds live in
`packages/notifications/src/types.ts`, and the settings catalog lives in
`packages/notifications/src/catalog.ts`; keep the database enum, catalog, and i18n labels in sync.

For client data fetching, use the oRPC helpers in
`apps/studio/modules/shared/lib/orpc-query-utils.ts` with TanStack Query.

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
  `apps/studio/modules/admin/components/users/UserList.tsx`, invitation revoke in
  `OrganizationInvitationsList.tsx`, and passkey CRUD in `PasskeysBlock.tsx`.

## Framework patterns

- TanStack Start does not use React Server Components or `"use client"`.
- Do not import from `next/*`, `next/navigation`, or other Next.js APIs.
- Use TanStack Router route loaders and `createServerFn` for server-side work.
- Use `throw redirect()` and `throw notFound()` from `@tanstack/react-router`.
- Follow the auth guard in `apps/studio/routes/_authenticated/route.tsx`.

## Auth & multi-tenancy

- Login, signup, password reset, email verification and personal security
  settings live in `apps/account` on `account.vesact.com`, which also serves the
  Better Auth endpoints. Products never render those pages: a signed-out
  request is redirected to `<VITE_ACCOUNT_URL>/login?redirectTo=<absolute URL>`
  through `loginUrl()` in `apps/studio/modules/auth/lib/login-url.ts`, and the
  auth app only sends users back to origins it knows (`getSafeRedirectUrl`).
  The session cookie sits on the environment's parent domain, so one login
  serves every product.
- Organizations, members, invitations, roles and permissions stay inside each
  product.
- Server sessions use `getSession` from `@auth/lib/auth-server.server`.
- Client session state uses `useSession` from `@auth/hooks/use-session`.
- Scope organization data with the active organization helpers under
  `apps/studio/modules/organizations`.
- When changing auth flows, update relevant templates under `packages/mail/emails`,
  preserve audit hooks, and verify locale handling.

Canonical auth example:
`apps/studio/modules/auth/lib/auth-server.server.ts`.

## Permissions (Permix)

- Definitions and rule builder: `@repo/permissions` (`createPermissionRules`,
  `checkPermission`, `PermissionsDefinition`).
- oRPC: `packages/api/orpc/permix.ts` + permissions attached in
  `packages/api/orpc/procedures.ts`.
- Studio server: `apps/studio/start.ts` (app-root `start.ts` because
  `srcDirectory: "."`) registers Permix via `createMiddleware().server(...)`
  so server-only auth/DB imports are stripped from the client graph. Shared
  helpers live in `apps/studio/modules/shared/lib/permix.ts`.
- Router context + hydrate in `apps/studio/routes/__root.tsx` via
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
  ReUI is the component layer. Visual rules, token targets and the chat
  components live in `docs/design.wip.md`.
- Use `@tanstack/react-form` with Zod. Follow
  `apps/marketing/modules/home/components/ContactForm.tsx`.
- Use `useTranslations`, `useFormatter`, and `IntlProvider` from `use-intl`.
  Follow `apps/studio/modules/i18n/provider.tsx`.
- Locale helpers and the `locale` cookie are configured in `packages/i18n/config.ts`.
- Document titles use `documentTitle()` from `@shared/lib/document-title`
  (`{page} – ${config.appName}`, en dash). Call it from every Studio route `head()`.
  Routes without a page title (marketing homepage) keep `config.appName` alone.

## Config & environment variables

Keep server-only variables unprefixed. Browser-visible variables use `VITE_`.
Use `.env.local` for local values and never commit it; secrets live encrypted under `secrets/`. Vite app configuration
uses the monorepo root as its environment directory.

## Environments & deployment

Each app is a Cloudflare Worker. Three environments, the same shape for every app:

|               | dev                                        | preview                                             | prod                                              |
| ------------- | ------------------------------------------ | --------------------------------------------------- | ------------------------------------------------- |
| Trigger       | `pnpm dev`                                 | pull request from this repository                   | push to `main`                                    |
| Build         | `vite dev`                                 | `CLOUDFLARE_ENV=preview vite build`                 | `vite build`                                      |
| Worker        | —                                          | `vesact-<app>-preview`                              | `vesact-<app>`                                    |
| Host          | `localhost:300x`                           | `<app>.preview.vesact.com`, behind Access           | custom domain                                     |
| Vars          | `.dev.vars`                                | `env.preview.vars` in `wrangler.jsonc`              | top-level `vars`                                  |
| Secrets       | `.dev.vars`                                | `secrets/<app>.preview.env`                         | `secrets/<app>.prod.env`                          |
| Database      | local postgres via `localConnectionString` | Hyperdrive `vesact-preview` → Neon branch `preview` | Hyperdrive `vesact-db` → Neon branch `production` |
| Migrations    | `push`                                     | `migrate` against the preview branch before deploy  | `migrate` against production before deploy        |
| Cookie domain | unset                                      | `.preview.vesact.com`, prefix `vesact-preview`      | `.vesact.com`                                     |

| App       | prod                 | preview                      |
| --------- | -------------------- | ---------------------------- |
| marketing | `www.vesact.com`     | `www.preview.vesact.com`     |
| account   | `account.vesact.com` | `account.preview.vesact.com` |
| studio    | `studio.vesact.com`  | `studio.preview.vesact.com`  |

`deploy.yml` runs one job per app: `select-target.sh` picks the target from the
event, `load-env.sh` decrypts what the job needs into masked environment
variables, then build → `wrangler deploy` → `wrangler secret bulk` → smoke
check. The account job runs the database migration first; the studio job waits
for it. The Cloudflare Vite plugin flattens the selected environment into
`.output/server/wrangler.json` at build time, so `CLOUDFLARE_ENV` is set for the
build and `wrangler deploy` takes no `--env`. Preview builds leave
`VITE_POSTHOG_KEY` unset so their events stay out of production analytics.

The preview database is one shared Neon branch; run the "Reset preview database"
workflow to copy it fresh from production. Preview shares the production R2
bucket.

### Accounts and resources

- Cloudflare account `6a8e5373d12070c930f09f1a82541a0b`, workers.dev subdomain
  `vesact`. CI authenticates with the token in `secrets/ci.env`; manual
  operations use `wrangler login`.
- Neon project `ancient-morning-26822519` (Singapore), branches `production`
  (default) and `preview`. Manage it with `neonctl` and `NEON_API_KEY` from
  `secrets/ci.env`.
- Hyperdrive `vesact-db` and `vesact-preview`; ids are in
  `apps/studio/wrangler.jsonc`.
- One Cloudflare Access application covers `*.preview.vesact.com` with two
  policies: Allow for the owner's email, and Service Auth for the service token
  whose credentials are `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` in
  `secrets/ci.env`. A new preview hostname is covered automatically; a path
  that outside services must reach gets its own, more specific application
  with a Bypass policy. `account.preview.vesact.com/api/auth` is one such
  application: the products call it cross-origin, Access answers every CORS
  preflight with 403 and its cookie is per hostname, so the auth endpoints are
  public on preview exactly as they are in production. The account pages
  themselves stay behind Access.
- `auth.vesact.com` and `auth.preview.vesact.com` stay attached to the account
  Workers and answer with a 301 to the `account.` hostname until 2026-12.
- Preview hostnames live under `preview.vesact.com` rather than `workers.dev`
  because `workers.dev` is on the Public Suffix List: no cookie can span two
  Workers there, so products could not share a login.
- One Google OAuth client serves every environment; each needs its callback
  `<VITE_ACCOUNT_URL>/api/auth/callback/google` registered in Google Cloud.
- `vesact.com` redirects to `www` through a Cloudflare Redirect Rule.

A second product gets its own hostname; the app stays rooted at `/` so that
origin-relative paths in the template keep working.

`VITE_STUDIO_URL`, `VITE_ACCOUNT_URL` and `VITE_MARKETING_URL` are the public URLs
the apps advertise: they drive Better Auth's `baseURL`, the CORS and
trusted-origin lists, links in email, and whether analytics reports. They are
read at build time, so a change needs a rebuild, not just a redeploy.

### Workflow

Branch from `main` and open a pull request. `validate-prs.yml` runs lint, type
check, build, unit and e2e; `deploy.yml` puts the branch on preview. Check the
preview, then merge with a merge commit; the push to `main` deploys production.

## Dependencies & supply chain

`pnpm-workspace.yaml` sets `minimumReleaseAge: 1440`; installing a release younger
than 24 hours can fail. Use existing `catalog:` versions where available and add
dependencies to the workspace package that imports them.

## Change management

- Use conventional commits such as `feat:`, `fix:`, `docs:`, or `refactor:`.
- Update relevant docs under `apps/marketing/content` for user-facing behavior.
- Update `AGENTS.md` when conventions, aliases, scripts, or app boundaries change.

## Before you're done

- [ ] `pnpm format` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] Relevant tests pass
- [ ] No `console.log` statements were added
- [ ] No unjustified `any` types were added
- [ ] User-facing strings have translations
- [ ] Relevant docs are updated

More documentation: [https://supastarter.dev/docs/tanstack-start](https://supastarter.dev/docs/tanstack-start)

## Template sync

This repository started from the supastarter template (`template` remote) and
has diverged: the app directory is renamed, template files are edited freely,
and merges are no longer attempted. Upstream is still read for dependency and
security updates.

- `git fetch template && git log --oneline template-reviewed..template/main`
  lists what has not been looked at. `template-reviewed` is a tag: after going
  through the range, move it with
  `git tag -f template-reviewed template/main && git push -f origin template-reviewed`.
- Take a commit with `git cherry-pick -x <sha>`. One that touches `apps/saas`
  conflicts as "deleted by us"; apply it to `apps/studio` instead:
  `git show <sha> -- apps/saas | sed 's#apps/saas#apps/studio#g' | git apply -3`.
- For dependency bumps, copy the version into the `pnpm-workspace.yaml` catalog
  and run `pnpm install` rather than cherry-picking lockfile changes.
- Removed rather than edited, and not to be restored: the auth pages and forms under
  `apps/studio/routes/{login,signup,forgot-password,reset-password,verify}`,
  `apps/studio/routes/_authenticated/_main/settings/security`,
  `apps/studio/modules/auth/components` and the security blocks in
  `apps/studio/modules/settings/components` (they moved to `apps/account`),
  `packages/storage/provider/s3`
  (the AWS SDK cannot construct a client on workerd; `provider/r2` signs with
  aws4fetch) and the unused analytics providers under
  `apps/marketing/modules/analytics/provider`.
- Product code uses names the template will never create (`inbox`, `contacts`,
  `publishing`, `relay`), and product tables live in their own schema file
  re-exported from `packages/database/drizzle/schema/index.ts`, never in
  `postgres.ts`, so upstream changes to those files apply cleanly.
- `.agents/skills/port-app-to-cloudflare` explains the Workers connection
  lifecycle in `packages/database/drizzle/client.ts` and `apps/studio/server.ts`.
  Repository-specific skills live in `.agents/skills/` under names the template
  will not use.
