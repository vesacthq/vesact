# [AGENTS.md](http://AGENTS.md)

This file applies to the whole `vesact` repository.
Mirror existing conventions and prefer nearby canonical implementations.
Explicit user instructions win; if a documented command fails, report it rather than inventing a workaround.

## Product context

Studio (`apps/studio`) is the first product; Relay, an API platform, is planned
as the second; the account center (`apps/account`) serves both. Design docs live
under `docs/`, one file per question: `docs/<app>/product.md` (what, for whom),
`docs/<app>/architecture.md` (how), `docs/decisions.md` (why), `docs/reference/`
(external facts with a checked date). `docs/README.md` is the map and the rules.
A file's frontmatter carries `status: draft | final`; a draft means use its
terms, but do not derive schemas or plans from it without asking.

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

| File                           | Reaches                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secrets/ci.env`               | GitHub Actions: Cloudflare, Turbo, Neon, Access                                                                                                                 |
| `secrets/account.<target>.env` | The account Worker: Better Auth secret, Google, mail, R2                                                                                                        |
| `secrets/database.<env>.env`   | `DATABASE_URL` for migrations, prod and preview                                                                                                                 |
| `secrets/studio.<env>.env`     | Worker secrets, synced on every deploy                                                                                                                          |
| `secrets/relay.<env>.env`      | The Relay Worker: the studio keys without `S3_*` (same `BETTER_AUTH_SECRET`), plus `META_APP_SECRET` and `META_WEBHOOK_VERIFY_TOKEN`                            |
| `secrets/<app>.dev.env`        | `apps/<app>/.dev.vars` via `pnpm secrets:pull`                                                                                                                  |
| `secrets/meta.env`             | The Meta app "Vesact": ids, secrets, test tokens; keys explained in `docs/reference/meta.md`; copied into `relay.<target>.env` when Relay deploys               |
| `secrets/company.yaml`         | Company facts: legal entity, registration numbers, Meta Business ID (keys visible, values encrypted)                                                            |
| `secrets/files/*`              | Documents and archives encrypted whole (`sops --encrypt --input-type binary --output-type json`); decrypt with `sops -d --input-type json --output-type binary` |

Edit with `sops secrets/<file>`; never commit a decrypted file. Anything under `secrets/` is encrypted by `.sops.yaml`.

`secrets/` is part of the project context, encrypted only because the repository
is public. When a task needs what is in there, decrypt and read it:
`sops -d secrets/<file>` for `.env` and `.yaml`,
`sops -d --input-type json --output-type binary secrets/files/<name>.json > /tmp/<name>`
for documents. Add a document with
`sops --encrypt --input-type binary --output-type json --filename-override secrets/files/<name>.json <path> > secrets/files/<name>.json`;
the file name is the index, so make it say what the document is and its date.
Decrypted values never go into docs, issues, commit messages or chat replies.

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

`pnpm dev` starts studio on 3000, marketing on 3001, docs on 3002, account on 3004, relay on
3005 and the mail preview on 3003. A fresh database has no seed data: register the first account
through the sign-up page. `push` applies the schema to the local database and
`studio` opens Drizzle Studio against it. Without `RESEND_API_KEY` mail is
logged to the console, so verification and magic-link URLs show up in the
account dev server's output. `pnpm --filter @repo/scripts create:user` creates
a verified user with a generated password and, on request, the `admin` role;
that is how the first platform admin comes to exist, later ones are promoted
from `/admin/users`. Analytics stays off locally (`import.meta.env.PROD` gates
it). MinIO only matters for uploads: `docker compose up -d minio minio-setup`.

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
| `pnpm status`                       | Tracks, stages, the Now issue and what is next, from GitHub  |

Required gates:

1. After every meaningful change, run `pnpm format` and `pnpm lint`.
2. Before every commit, run `pnpm type-check`.
3. Run the relevant tests before considering the change complete.
4. Before pushing, run `pnpm verify`: it is the exact command of CI's lint job,
   and it catches files a dev server regenerated after your last `pnpm format`.

The root test task runs Vitest in `apps/account`, `apps/marketing`, `apps/studio`,
`packages/api` and `packages/permissions`. Playwright tests are in
`apps/marketing/tests`, `apps/account/e2e` and `apps/studio/e2e`; run them per
app with `pnpm --filter <app> e2e` (UI) or `e2e:ci`. Each config starts its own
dev server (marketing 3001, studio 3100, account 3200). The account suite signs
in through the login page as two users that `e2e/auth.setup.ts` seeds straight
into the database (`e2e/fixtures/users.ts`), so it needs Postgres with the
schema pushed. Its config serves the app on the port `VITE_ACCOUNT_URL` names
(3004 locally, from `.env.local`), the only port at which the client bundle,
the Worker and the server agree; stop a running account dev server first or set
`PW_REUSE_SERVER=1`. CI's e2e job starts Postgres and MinIO, pushes the schema
and runs all three suites with generated `.dev.vars` and job-level `VITE_*`
URLs for the ports it serves.

## Monorepo map

```text
apps/
├── account/       # Account center: login, profile, organizations, billing, platform admin; serves Better Auth
├── docs/          # TanStack Start/Fumadocs documentation
├── mail-preview/  # React Email preview
├── marketing/     # Public site, blog, and content
├── relay/         # Relay: the API platform's Worker, `/v1` + webhooks on api., console on relay.
└── studio/        # Authenticated product
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
brand/             # Brand kit: logos, app icons, per-site favicon sets; `brand/README.md` explains the files
```

`brand/` is the source of every logo and icon. Apps keep their own copies of
what they serve (`apps/<app>/public/`, the `Logo` component in `@repo/ui`);
update those from `brand/` rather than editing them in place.

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
| `@payments/*`      | `./modules/payments/*`      |
| `@i18n/*`          | `./modules/i18n/*`          |
| `@ai/*`            | `./modules/ai/*`            |
| `@shared/*`        | `./modules/shared/*`        |

### `apps/account/tsconfig.json`

| Alias              | Target                      |
| ------------------ | --------------------------- |
| `@config`          | `./config`                  |
| `@auth/*`          | `./modules/auth/*`          |
| `@account/*`       | `./modules/account/*`       |
| `@admin/*`         | `./modules/admin/*`         |
| `@organizations/*` | `./modules/organizations/*` |
| `@onboarding/*`    | `./modules/onboarding/*`    |
| `@payments/*`      | `./modules/payments/*`      |
| `@i18n/*`          | `./modules/i18n/*`          |
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
`queryClient.ensureQueryData(...)` with the query options in
`modules/auth/lib/api.ts` and `modules/organizations/lib/api.ts` (both apps):
`router.tsx` puts the `QueryClient` in the router context and
`setupRouterSsrQueryIntegration` hydrates the client cache, so a client-side
navigation makes no server round trip. `defaultPreload: "intent"` preloads on
hover; the progress bar in `ClientProviders` follows the router's status.

### Relay API

Relay's public API lives in `packages/api/modules/relay` with its own router,
context and handler (prefix `/v1`), mounted by `apps/relay/src/api.ts`. Keys
belong to an organization and come from `@better-auth/api-key` on the shared
auth instance (prefix `relay_`, 300 requests per minute per key by default);
they are created, listed and revoked through the account center's
`/api/auth/api-key/*` endpoints, guarded by the `apiKey` statement in
`packages/auth/lib/access.ts`. `app.ts` verifies the key before oRPC runs and
puts `{ requestId, auth: { organizationId, apiKeyId, permissions, key } }` in
the context; business endpoints build on `relayKeyProcedure`. Every `/v1` response
carries `X-Request-Id`, authenticated ones the `X-RateLimit-*` headers, and
each authenticated call writes a `relay_api_usage` row after the response.
`/v1/health`, `/v1/openapi.json` and `/v1/docs` need no key: the OpenAPI
document is generated from the router on request (contracts change only in
zod, there is no hand-written spec) and Scalar renders it at `/v1/docs`.
`idempotent` in `lib/idempotency.ts` is mounted per POST route after the key
check (none yet): it keeps the first response for 24 hours per key, route and
`Idempotency-Key`, replays it for the same body, and answers 422 for another
body or 409 while the first request runs.
Errors, even those raised before a procedure, use oRPC's body shape. Relay's
tables live in `packages/database/drizzle/schema/relay.ts`. The acceptance run
for the chain is `pnpm --filter @repo/scripts relay:acceptance` (see the
script's header for the arguments).

Meta's webhook is `GET`/`POST /webhooks/meta` in
`packages/api/modules/relay/integrations/meta/webhook.ts`: the handshake checks
`META_WEBHOOK_VERIFY_TOKEN`, the POST verifies `X-Hub-Signature-256` against
`META_APP_SECRET` and stores the parsed body in `relay_inbound_event`, deduplicated
by the raw body's SHA-256; nothing is parsed yet. Its acceptance run is
`pnpm --filter @repo/scripts relay:webhook-acceptance`.

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
  `apps/account/modules/admin/components/users/UserList.tsx`, invitation revoke in
  `OrganizationInvitationsList.tsx`, and passkey CRUD in `PasskeysBlock.tsx`.

## Framework patterns

- TanStack Start does not use React Server Components or `"use client"`.
- Do not import from `next/*`, `next/navigation`, or other Next.js APIs.
- Use TanStack Router route loaders and `createServerFn` for server-side work.
- Use `throw redirect()` and `throw notFound()` from `@tanstack/react-router`.
- Follow the auth guard in `apps/studio/routes/_authenticated/route.tsx`.
- List state that belongs in the URL (page, search term) uses the route's
  `validateSearch` and `getRouteApi(...).useNavigate()`; links out of such a
  page pass `search={(prev) => ({ from: prev.from })}` so that state stays on
  the list. nuqs is Studio-only: its TanStack adapter re-renders the whole
  query string as a path and collapses the `//` inside `from`.

## Account center & multi-tenancy

One rule decides where a page goes: what exists independently of any product
belongs to the account center (`apps/account`, `account.vesact.com`); what only
makes sense with product data belongs to the product. `docs/account/architecture.md`
has the ownership table, the route table and the "operation → location" list.

- The account center serves the Better Auth endpoints and every identity flow
  (login, signup, password reset, verification), the profile, security and
  notification settings, organizations, members, invitations, onboarding and
  billing. Products keep the organization switcher, product settings and
  product-internal permissions; they read organizations and members, never
  edit them. The platform-admin module (every user and organization, gated by
  `admin.access`) is the account center's `/admin`; Studio's sidebar links to it
  like any other account center entry.
- Two link conventions, both built in `apps/studio/modules/auth/lib/account-urls.ts`:
  identity flows take `redirectTo=<absolute URL>`, the place the flow ends
  (`loginUrl()`, `onboardingUrl()`); settings pages take `from=<absolute URL>`,
  the page the user left (`accountCenterUrl(path, from)`), and the account
  center's header shows a back button to it, naming the product. The account
  center only follows its own origins (`getSafeRedirectUrl`, `getReturnUrl`).
- Sidebar entries that lead to the account center are plain links marked
  `external` in `use-app-nav.ts`; they look like every other entry.
- The session cookie sits on the parent domain of `VITE_ACCOUNT_URL`
  (`getCookieDomain` in `@repo/utils`), so one login serves every product and
  local development keeps host-only cookies.
- Members carry one organization role (`owner`, `admin`, `member`) plus at most
  one role per product (`studio:admin`, `studio:member`, `relay:admin`,
  `relay:developer`) in `member.role`, comma-separated. Better Auth enforces
  them on its own endpoints through `packages/auth/lib/access.ts`;
  `@repo/permissions` parses the same value (`parseMemberRoles`) into Permix
  rules, including `studio.access` / `relay.manage`. Owners and admins hold
  every product. Admins and the `relay:*` roles also hold the organization's
  `apiKey` actions, which the api-key plugin checks on its endpoints. Studio checks `studio.access` in
  `routes/_authenticated/_main/$organizationSlug/route.tsx` and renders a
  denial that links to the account center's members page.
- Server sessions use `getSession` from `@auth/lib/auth-server.server`; client
  session state uses `useSession` from `@auth/hooks/use-session` (both apps).
- Scope organization data in Studio with the active organization helpers under
  `apps/studio/modules/organizations`; in the account center the `$organizationSlug`
  layout provides `useOrganization()`.
- When changing auth flows, update relevant templates under `packages/mail/emails`,
  preserve audit hooks, and verify locale handling.

Canonical auth example:
`apps/studio/modules/auth/lib/auth-server.server.ts`.

## Permissions (Permix)

- Definitions and rule builder: `@repo/permissions` (`createPermissionRules`,
  `checkPermission`, `PermissionsDefinition`).
- oRPC: `packages/api/orpc/permix.ts` + permissions attached in
  `packages/api/orpc/procedures.ts`.
- Studio: the router context carries a Permix instance. The `_authenticated`
  layout's `beforeLoad` builds the rules from the session and the active
  organization's membership (`createPermissionRules`), calls `permix.setup`
  and returns `permixState`, which `PermixHydrate` in that layout applies on
  the client. Nothing runs per request on the server. Client
  `PermixProvider` / `usePermissions()`.
- Prefer `checkPermission(...)` / `usePermissions().check(...)` over
  `isOrganizationAdmin` and inline `role === "..."` comparisons. Keep
  `@repo/auth/lib/helper` wrappers only for backwards compatibility.
- For user-scoped gates like `admin.access`, prefer `checkPermission({ user })`
  over `permix.getOrThrow(context).check(...)` so the gate does not depend on
  request-middleware setup having completed.
- Better Auth `organization.*` client endpoints are not covered by Permix;
  they are guarded by the roles in `packages/auth/lib/access.ts`. They also
  require the caller to be a member, so pages that act on any organization
  (the platform admin) go through `adminProcedure` instead.
- The account center has no Permix middleware or provider: routes and
  components call `checkPermission` with the session user
  (`admin.access`) or the member's roles (`organization.*`).
- `admin.access` is `user.role === "admin"`; the `admin()` plugin has no
  allow-list, so the first admin comes from `create:user` or the database.

## UI, forms, and i18n

- Use components from `@repo/ui/components`; compose with Base UI primitives.
  ReUI is the component layer. Visual rules, token targets and the chat
  components live in `docs/shared/design-system.md`.
- Use `@tanstack/react-form` with Zod. Follow
  `apps/marketing/modules/home/components/ContactForm.tsx`.
- Use `useTranslations`, `useFormatter`, and `IntlProvider` from `use-intl`.
  Follow `apps/studio/modules/i18n/provider.tsx`.
- Locale helpers and the `locale` cookie are configured in `packages/i18n/config.ts`.
  Messages are scoped per app (`studio.json`, `account.json`, `marketing.json`,
  `mail.json`) plus `shared.json`, which every scope receives; the settings menu
  labels both apps show live in `shared.json` under `settings.menu`.
- Document titles use `documentTitle()` from `@shared/lib/document-title`
  (`{page} – ${config.appName}`, en dash). Call it from every Studio route `head()`.
  Routes without a page title (marketing homepage) keep `config.appName` alone.

## Config & environment variables

Keep server-only variables unprefixed. Browser-visible variables use `VITE_`.
Use `.env.local` for local values and never commit it; secrets live encrypted under `secrets/`. Vite app configuration
uses the monorepo root as its environment directory.

## Environments & deployment

Each app is a Cloudflare Worker. Three environments, the same shape for every app:

|               | dev                                         | preview                                             | prod                                              |
| ------------- | ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Trigger       | `pnpm dev`                                  | pull request from this repository                   | push to `main`                                    |
| Build         | `vite dev`                                  | `CLOUDFLARE_ENV=preview vite build`                 | `vite build`                                      |
| Worker        | —                                           | `vesact-<app>-preview`                              | `vesact-<app>`                                    |
| Host          | `localhost:300x`                            | `<app>.preview.vesact.com`, behind Access           | custom domain                                     |
| Vars          | `.dev.vars`                                 | `env.preview.vars` in `wrangler.jsonc`              | top-level `vars`                                  |
| Secrets       | `.dev.vars`                                 | `secrets/<app>.preview.env`                         | `secrets/<app>.prod.env`                          |
| Database      | local postgres via `localConnectionString`  | Hyperdrive `vesact-preview` → Neon branch `preview` | Hyperdrive `vesact-db` → Neon branch `production` |
| Migrations    | `push`                                      | `migrate` against the preview branch before deploy  | `migrate` against production before deploy        |
| Cookie domain | host-only (derived from `VITE_ACCOUNT_URL`) | `.preview.vesact.com`, prefix `vesact-preview`      | `.vesact.com`                                     |

| App       | prod                                                 | preview                                              |
| --------- | ---------------------------------------------------- | ---------------------------------------------------- |
| marketing | `www.vesact.com`                                     | `www.preview.vesact.com`                             |
| account   | `account.vesact.com`                                 | `account.preview.vesact.com`                         |
| studio    | `studio.vesact.com`                                  | `studio.preview.vesact.com`                          |
| relay     | `relay.vesact.com` (console), `api.vesact.com` (API) | `relay.preview.vesact.com`, `api.preview.vesact.com` |

`deploy.yml` runs one job per app: `select-target.sh` picks the target from the
event, `load-env.sh` decrypts what the job needs into masked environment
variables, then build → `wrangler deploy` → `wrangler secret bulk`. The account job runs the database migration first; the studio and relay jobs
wait for it. The relay Worker answers on two custom domains and dispatches by
path (`docs/relay/architecture.md` §2). The Cloudflare Vite plugin flattens the selected environment into
`.output/server/wrangler.json` at build time, so `CLOUDFLARE_ENV` is set for the
build and `wrangler deploy` takes no `--env`. Preview builds leave
`VITE_POSTHOG_KEY` unset so their events stay out of production analytics.
`apps/<app>/public/_headers` marks `/assets/*` immutable for a year: Workers static
assets otherwise answer `max-age=0, must-revalidate`, so browsers revalidate
every hashed file on every page. The file applies to static assets only, never
to Worker responses.

The preview database is one shared Neon branch; run the "Reset preview database"
workflow to copy it fresh from production. Preview shares the production R2
bucket. The `avatars` bucket's CORS rule allows `PUT` from
`account.vesact.com` and `account.preview.vesact.com`, the only hostnames that
upload from the browser; a new uploading hostname has to be added there or the
presigned PUT fails with a CORS error.
The `S3_*` credentials in the studio and account secrets are an account-owned
API token named "vesact avatars bucket (account and studio workers)", scoped to
that bucket: the access key id is the token id, the secret is the SHA-256 hex
of the token value. Rotate by creating a new token the same way
(`POST /accounts/{id}/tokens`), editing the four `<app>.<target>.env` files
with `sops set`, and deploying.

### Accounts and resources

- Cloudflare account `6a8e5373d12070c930f09f1a82541a0b`, workers.dev subdomain
  `vesact`. CI authenticates with the token in `secrets/ci.env`; manual
  operations use `wrangler login`.
- Neon project `ancient-morning-26822519` (Singapore), branches `production`
  (default) and `preview`. Manage it with `neonctl` and `NEON_API_KEY` from
  `secrets/ci.env`.
- Hyperdrive `vesact-db` and `vesact-preview` for studio and account (ids in
  `apps/studio/wrangler.jsonc`), `vesact-relay-db` and `vesact-relay-preview`
  for relay (ids in `apps/relay/wrangler.jsonc`). All four have query caching
  disabled: Hyperdrive would otherwise serve a read for up to 60 seconds
  after a write, and nothing here tolerates that (an organization missing
  from its list after creation, a revoked key still verifying). Add a cached
  configuration only for a specific hot read that can be stale, and route
  just that query through it.
  The studio, account and relay Workers run with Smart Placement
  (`placement.mode: "smart"`), so a request's queries run next to the
  database instead of at the visitor's edge location.
- One Cloudflare Access application covers `*.preview.vesact.com` with two
  policies: Allow for the owner's email, and Service Auth for the service token
  whose credentials are `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` in
  `secrets/ci.env`. A new preview hostname is covered automatically; a path
  that outside services must reach gets its own, more specific application
  with a Bypass policy. `account.preview.vesact.com/api/auth` is one such
  application: the products call it cross-origin, Access answers every CORS
  preflight with 403 and its cookie is per hostname, so the auth endpoints are
  public on preview exactly as they are in production. The account pages
  themselves stay behind Access. `api.preview.vesact.com/webhooks` is the
  other one, so Meta can reach the preview webhook.
  The zone's Bot Fight Mode stays on and cannot be skipped by a WAF rule on
  the Free plan; it challenges curl from the GitHub runner, which is why the
  deploy makes no HTTP check after `wrangler deploy` (the earlier smoke check
  failed with 403 and `cf-mitigated: challenge`). Verify a deploy by hand or
  through Workers versions instead.
- `auth.vesact.com` and `auth.preview.vesact.com` stay attached to the account
  Workers and answer with a 301 to the `account.` hostname until 2026-12.
- Preview hostnames live under `preview.vesact.com` rather than `workers.dev`
  because `workers.dev` is on the Public Suffix List: no cookie can span two
  Workers there, so products could not share a login.
- One Google OAuth client serves every environment; each needs its callback
  `<VITE_ACCOUNT_URL>/api/auth/callback/google` registered in Google Cloud.
- `vesact.com` and `preview.vesact.com` redirect to their `www` hostnames through
  Cloudflare Redirect Rules on a proxied `AAAA 100::` record each.

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
- Removed rather than edited, and not to be restored: everything that moved to
  `apps/account`: the auth pages and forms under
  `apps/studio/routes/{login,signup,forgot-password,reset-password,verify}`,
  `apps/studio/routes/_authenticated/_main/settings`,
  `apps/studio/routes/_authenticated/_main/$organizationSlug/settings`,
  `apps/studio/routes/_authenticated/{onboarding,new-organization,organization-invitation,choose-plan,checkout-return}`,
  `apps/studio/modules/{auth/components,settings,onboarding}`, the organization
  forms, member and invitation lists in `apps/studio/modules/organizations/components`
  and the plan components in `apps/studio/modules/payments/components`; also
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
