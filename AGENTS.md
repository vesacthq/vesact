# [AGENTS.md](http://AGENTS.md)

This file applies to the whole `vesact` repository; detail it only points to lives in the `vesact-*` skills under `.agents/skills/`.
Mirror existing conventions and prefer nearby canonical implementations.
Explicit user instructions win; if a documented command fails, report it rather than inventing a workaround.

## Product context

Studio (`apps/studio`) is the first product; Relay, an API platform, is planned
as the second; the account center (`apps/account`) serves both. Design docs live
under `docs/`, one file per question (`product.md`, `architecture.md`,
`decisions.md`, `reference/`); `docs/README.md` is the map and the rules. A
file's frontmatter carries `status: draft | final`; a draft means use its terms,
but do not derive schemas or plans from it without asking.

Work is tracked in GitHub issues: track → stage → deliverable, linked as
sub-issues and viewed in the org project "Vesact" (Status: Backlog / Next / Now /
Done, exactly one Now). Scope, acceptance and order live only in the issue;
`pnpm status` prints the current state. The `deferred` label means "no start
date; do it when the trigger in the first line of the issue is met".

## Stack

- TanStack Start, TanStack Router, React, TypeScript, Vite, and Node.js 22+
- pnpm workspaces, Turborepo, Nitro, oRPC, Hono, and Better Auth
- Drizzle ORM, Tailwind CSS, shadcn/ui (base-vega registry), and Base UI
- TanStack Form, TanStack Query, Zod 4, use-intl, Vitest, Playwright, Oxlint, and Oxfmt

## Setup & verification

Secrets are committed encrypted under `secrets/` with sops + age: read with `sops -d secrets/<file>`,
edit with `sops secrets/<file>`, never commit a decrypted file, and decrypted values never go
into docs, issues, commit messages or chat replies. `.env.local` feeds the Vite build and the
Node-side scripts; `apps/<app>/.dev.vars` (from `pnpm secrets:pull`) is what the Worker reads
at runtime. File map, keys, ports, first user and the e2e setup: `vesact-secrets-and-local-env` skill.

```bash
docker compose up -d postgres   # PostgreSQL 16 on host port 5433
pnpm install
pnpm dev                        # studio 3000, marketing 3001, docs 3002, mail preview 3003, account 3004, relay 3005
```

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
| `pnpm status`                       | Tracks, stages, the Now issue and what is next, from GitHub  |

Required gates:

1. After every meaningful change, run `pnpm format` and `pnpm lint`.
2. Before every commit, run `pnpm type-check`.
3. Run the relevant tests before considering the change complete.
4. Before pushing, run `pnpm verify`: it is the exact command of CI's lint job,
   and it catches files a dev server regenerated after your last `pnpm format`.

Playwright suites run per app with `pnpm --filter <app> e2e` (UI) or `e2e:ci`;
suite locations, ports and seeding are in the `vesact-secrets-and-local-env` skill.

## Monorepo map

```text
apps/
├── account/       # Account center: login, profile, organizations, billing, platform admin; serves Better Auth
├── docs/          # TanStack Start/Fumadocs documentation
├── mail-preview/  # React Email preview
├── marketing/     # Public site, blog, and content
├── relay/         # Relay: the API platform's Worker, `/v1` + webhooks on api., console on relay.
└── studio/        # Authenticated product
packages/          # ai, api, auth, database, i18n, logs, mail, notifications, payments, permissions (Permix definitions + rule builder), relay (Relay's own db, later api/auth/contract), storage, ui, utils
tooling/           # scripts, tailwind, typescript
brand/             # Brand kit: logos, app icons, per-site favicon sets; `brand/README.md` explains the files
```

`brand/` is the source of every logo and icon. Apps keep their own copies of what they serve
(`apps/<app>/public/`, the `Logo` component in `@repo/ui`, `apps/marketing/public/brand/`); update those from `brand/`.

## Imports & path aliases

`@repo/*` and `@repo/ui/*` are pnpm workspace package names, not TypeScript, Vite, or
TanStack path mappings; use package exports such as `@repo/auth` and `@repo/ui/components/button`.
App-local aliases (`@config`, `@auth/*`, `@shared/*`, ...) are defined in each
`apps/<app>/tsconfig.json`; read it before adding an import.

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

Relay has its own database and package: `packages/relay/db` (`RELAY_DATABASE_URL`, local
database `vesact_relay`) with `pnpm --filter @repo/relay db:push | db:generate | db:migrate | db:studio`.

Do not hand-edit generated Drizzle migration files or route trees:
`apps/marketing/routeTree.gen.ts`, `apps/studio/routeTree.gen.ts`,
`apps/account/routeTree.gen.ts`, and `apps/docs/src/routeTree.gen.ts` are generated. Marketing content collections under
`apps/marketing/.content-collections/` are also generated.

### Notifications

Create server-side notifications with `createNotification` from
`packages/notifications/src/create-notification.ts`. Types and kinds live in
`packages/notifications/src/types.ts`, and the settings catalog lives in
`packages/notifications/src/catalog.ts`; keep the database enum, catalog, and i18n labels in sync.

For client data fetching, use the oRPC helpers in
`apps/studio/modules/shared/lib/orpc-query-utils.ts` with TanStack Query.
Route guards read the session and organizations through
`queryClient.ensureQueryData(...)` with the query options in `modules/auth/lib/api.ts`
and `modules/organizations/lib/api.ts` (both apps); the router context carries the
`QueryClient` and SSR hydrates the client cache, so navigation makes no server round trip.

### Relay API

Relay's public API lives in `packages/api/modules/relay` (prefix `/v1`), mounted by
`apps/relay/src/api.ts`; keys come from `@better-auth/api-key` on the shared auth instance
and business endpoints build on `relayKeyProcedure`. Keys, rate limits, request ids, idempotency,
the Meta webhook and the console routes: `vesact-relay-api` skill; design: `docs/relay/architecture.md`.

### Client cache invalidation

After every successful mutation that affects a list or detail query—whether
oRPC, `authClient`, or any other write—invalidate the matching TanStack Query
keys before showing success UI. Do not rely on a full page reload.

- oRPC lists: `queryClient.invalidateQueries({ queryKey: orpc.<module>.list.key() })`;
  prefix keys refresh every filtered/paginated page. Non-oRPC lists: the same key
  the list query uses (`organizationListQueryKey`, `userPasskeyQueryKey`, `["active-sessions"]`).
- One mutation, several cached views: invalidate every affected key (admin org
  CRUD also refreshes `organizationListQueryKey`; member leave refreshes the
  members query and the org switcher list).
- Canonical examples: `apps/account/modules/admin/components/users/UserList.tsx`
  (delete), `OrganizationInvitationsList.tsx` (revoke), `PasskeysBlock.tsx` (CRUD).

## Framework patterns

- TanStack Start does not use React Server Components or `"use client"`.
- Do not import from `next/*`, `next/navigation`, or other Next.js APIs.
- Use TanStack Router route loaders and `createServerFn` for server-side work.
- Use `throw redirect()` and `throw notFound()` from `@tanstack/react-router`.
- Follow the auth guard in `apps/studio/routes/_authenticated/route.tsx`.
- List state that belongs in the URL (page, search term) uses the route's `validateSearch`
  and `getRouteApi(...).useNavigate()`; links out of such a page pass
  `search={(prev) => ({ from: prev.from })}` so that state stays on the list. nuqs is
  Studio-only: its TanStack adapter re-renders the whole query string as a path and collapses the `//` inside `from`.

## Account center & multi-tenancy

One rule decides where a page goes: what exists independently of any product
belongs to the account center (`apps/account`, mounted at `/account` under the Studio
hostname; production still answers on `account.vesact.com` until #121); what only
makes sense with product data belongs to the product. `docs/account/architecture.md`
has the ownership and route tables, the "operation → location" list, the link
conventions (`redirectTo` for identity flows, `from` for settings pages) and the
three layers of roles. Products read organizations and members, never edit them;
the platform-admin module (gated by `admin.access`) is the account center's `/admin`.

- Links into the account center: `apps/studio/modules/auth/lib/account-urls.ts`
  (`loginUrl()`, `onboardingUrl()`, `accountCenterUrl(path, from)`); it only
  follows its own origins (`getSafeRedirectUrl`, `getReturnUrl`). Sidebar entries
  that lead there are plain links marked `external` in `use-app-nav.ts`.
- `VITE_ACCOUNT_URL` is the account center's full address, path included
  (`https://studio.preview.vesact.com/account`, `http://localhost:3004/account`): Vite's
  `base`, the router basepath, Better Auth's `basePath` and the `@repo/api` mount all derive
  from it (`basePath` in `@repo/utils`), so Studio and the account center share one hostname
  and a host-only session cookie. While production still serves the account center from its
  own hostname, `packages/auth` sets the cookie on the parent domain (`getCookieDomain`).
- `member.role` holds one organization role plus at most one role per product,
  comma-separated. Better Auth enforces them through `packages/auth/lib/access.ts`;
  `@repo/permissions` parses the same value (`parseMemberRoles`) into Permix
  rules such as `studio.access` / `relay.manage`, which Studio checks in
  `routes/_authenticated/_main/$organizationSlug/route.tsx`.
- Sessions: `getSession` from `@auth/lib/auth-server.server` on the server,
  `useSession` from `@auth/hooks/use-session` on the client (both apps).
  Canonical example: `apps/studio/modules/auth/lib/auth-server.server.ts`.
- Organization scope: the active organization helpers under `apps/studio/modules/organizations`
  in Studio; `useOrganization()` from the `$organizationSlug` layout in the account center.
- When changing auth flows, update the templates under `packages/mail/emails`,
  preserve audit hooks, and verify locale handling.

## Permissions (Permix)

- Definitions and rule builder: `@repo/permissions` (`createPermissionRules`,
  `checkPermission`, `PermissionsDefinition`). oRPC: `packages/api/orpc/permix.ts`,
  permissions attached in `packages/api/orpc/procedures.ts`.
- Studio: the `_authenticated` layout's `beforeLoad` builds the rules from the session
  and the active organization's membership (`createPermissionRules`), calls `permix.setup`
  and returns `permixState`, which `PermixHydrate` applies on the client; nothing runs
  per request on the server. Client side: `PermixProvider` / `usePermissions()`.
- Prefer `checkPermission(...)` / `usePermissions().check(...)` over `isOrganizationAdmin`
  and inline `role === "..."` comparisons; keep `@repo/auth/lib/helper` wrappers only for
  backwards compatibility. For user-scoped gates like `admin.access`, prefer
  `checkPermission({ user })` over `permix.getOrThrow(context).check(...)` so the gate
  does not depend on request-middleware setup having completed.
- Better Auth `organization.*` client endpoints are not covered by Permix; they
  are guarded by the roles in `packages/auth/lib/access.ts` and require the
  caller to be a member, so pages that act on any organization (the platform
  admin) go through `adminProcedure` instead.
- The account center has no Permix middleware or provider: routes and components call
  `checkPermission` with the session user (`admin.access`) or the member's roles
  (`organization.*`). `admin.access` is `user.role === "admin"`; the `admin()` plugin
  has no allow-list, so the first admin comes from `create:user` or the database.

## UI, forms, and i18n

- Use components from `@repo/ui/components`; compose with Base UI primitives.
  ReUI is the component layer. Visual rules, token targets and the chat
  components live in `docs/shared/design-system.md`.
- Use `@tanstack/react-form` with Zod. Follow
  `apps/marketing/modules/home/components/ContactForm.tsx`.
- Use `useTranslations`, `useFormatter`, and `IntlProvider` from `use-intl`.
  Follow `apps/studio/modules/i18n/provider.tsx`.
- Locales are `en` and `zh`, configured with the `locale` cookie in `packages/i18n/config.ts`;
  a new one is a folder under `packages/i18n/translations/` plus entries in `config.ts`
  and `messages.ts`. Messages are scoped per app (`studio.json`, `account.json`,
  `relay.json`, `marketing.json`, `mail.json`) plus `shared.json`, which every scope
  receives; the settings menu labels both apps show live in `shared.json` under `settings.menu`.
- Document titles use `documentTitle()` from `@shared/lib/document-title`
  (`{page} – ${config.appName}`, en dash) in every Studio route `head()`;
  routes without a page title (marketing homepage) keep `config.appName` alone.

## Config & environment variables

Keep server-only variables unprefixed. Browser-visible variables use `VITE_`. Use `.env.local`
for local values and never commit it; secrets live encrypted under `secrets/`. Vite app configuration uses the monorepo root as its environment directory.

## Environments & deployment

Each app is a Cloudflare Worker; studio, account and marketing also build a Docker target
(below). Three environments, the same shape for every app:

|               | dev                                        | preview                                                                                   | prod                                              |
| ------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Trigger       | `pnpm dev`                                 | pull request from this repository                                                         | push to `main`                                    |
| Build         | `vite dev`                                 | `CLOUDFLARE_ENV=preview vite build`                                                       | `vite build`                                      |
| Worker        | —                                          | `vesact-<app>-preview`                                                                    | `vesact-<app>`                                    |
| Host          | `localhost:300x`                           | `<app>.preview.vesact.com`, behind Access; account at `studio.preview.vesact.com/account` | custom domain                                     |
| Vars          | `.dev.vars`                                | `env.preview.vars` in `wrangler.jsonc`                                                    | top-level `vars`                                  |
| Secrets       | `.dev.vars`                                | `secrets/<app>.preview.env`                                                               | `secrets/<app>.prod.env`                          |
| Database      | local postgres via `localConnectionString` | Hyperdrive `vesact-preview` → Neon branch `preview`                                       | Hyperdrive `vesact-db` → Neon branch `production` |
| Migrations    | `push`                                     | `migrate` against the preview branch before deploy                                        | `migrate` against production before deploy        |
| Cookie domain | host-only                                  | host-only (studio and account share the hostname), prefix `vesact-preview`                | `.vesact.com` until #121                          |

`deploy.yml` runs one job per app: build → `wrangler deploy` → `wrangler secret bulk`, the
account job's migration first for the Studio database and the relay job migrating Relay's own,
plus an `images` job that pushes the Docker target to GHCR on `main`. It makes no HTTP check after the Worker deploy (Bot Fight Mode challenges the runner):
verify by hand or through Workers versions. `VITE_STUDIO_URL`, `VITE_ACCOUNT_URL` and
`VITE_MARKETING_URL` are read at build time, so a change needs a rebuild.
Hostnames, pipeline scripts, preview database, R2, Cloudflare, Neon, Hyperdrive and Access: `vesact-deploy-and-infra` skill.

### Docker target

`pnpm --filter <app> build:node` builds studio, account or marketing without the Cloudflare
plugin (`BUILD_TARGET=node`, output in `.output/node/`, the app's own `src/server.ts` as the
entry) and `pnpm --filter <app> start:node` serves it with srvx. The root `Dockerfile`
(`docker build --build-arg APP=<app> --build-arg VITE_STUDIO_URL=… .`) packages that build;
`docker-compose.prod.yml` runs the three containers behind Caddy (`Caddyfile`: `/account/*` to
account, the rest of the Studio hostname to studio) with one Postgres, reading each app's
runtime variables from `env/<app>.env` and `SITE_ADDRESS`, `MARKETING_ADDRESS`,
`POSTGRES_PASSWORD` from the compose environment. The Docker target only uses what both
targets have (`docs/studio/architecture.md` §5.4). Every pull request builds the images and
smokes the stack (`validate-prs.yml` job "Docker target", `.github/scripts/smoke.sh`); pushes to
`main` publish `ghcr.io/vesacthq/vesact-<app>:<sha>` and `:latest`, and the `vps` job puts
them on the rehearsal machine (`jp.vesact.com`) — migrate, sync, pull, smoke, roll back on
failure. The machine and the procedure: `vesact-deploy-and-infra` skill.

### Workflow

Branch from `main`. Before opening a code pull request, run the
`vesact-review-pr` skill and fix what survives its verification on the same
branch. `validate-prs.yml` runs lint, type check, build, unit, the Docker smoke and e2e;
`deploy.yml` puts the branch on preview. Check the preview, then merge with a
merge commit; the push to `main` deploys production.

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

This repository started from the supastarter template (`template` remote) and has diverged:
merges are no longer attempted, upstream is read for dependency and security updates. The
review and cherry-pick procedure and the list of template files removed on purpose: `vesact-template-sync` skill.
