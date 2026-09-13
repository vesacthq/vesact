---
name: vesact-deploy-and-infra
description: "Use when deploying, debugging deploy.yml or validate-prs.yml, rotating the R2 credentials, or touching the Cloudflare, Neon, Hyperdrive, Access, R2 or DNS resources behind the dev, preview and prod environments."
---

# Deployment and infrastructure

The environment matrix (dev / preview / prod) is in `AGENTS.md` under
"Environments & deployment".

## Hostnames

| App       | prod                                                 | preview                                              |
| --------- | ---------------------------------------------------- | ---------------------------------------------------- |
| marketing | `www.vesact.com`                                     | `www.preview.vesact.com`                             |
| account   | `account.vesact.com` (until #121)                    | `studio.preview.vesact.com/account` (Workers route)  |
| studio    | `studio.vesact.com`                                  | `studio.preview.vesact.com`                          |
| relay     | `relay.vesact.com` (console), `api.vesact.com` (API) | `relay.preview.vesact.com`, `api.preview.vesact.com` |

## Deploy pipeline

`deploy.yml` runs one job per app: `select-target.sh` picks the target from the
event, `load-env.sh` decrypts what the job needs into masked environment
variables, then build → `wrangler deploy` → `wrangler secret bulk`. The account job runs the database migration first; the studio and relay jobs
wait for it. On `main` the `images` job also builds the Docker target of
studio, account and marketing and pushes it to GHCR (see "Docker target"). The relay Worker answers on two custom domains and dispatches by
path (`docs/relay/architecture.md` §2). The Cloudflare Vite plugin flattens the selected environment into
`.output/server/wrangler.json` at build time, so `CLOUDFLARE_ENV` is set for the
build and `wrangler deploy` takes no `--env`. Preview builds leave
`VITE_POSTHOG_KEY` unset so their events stay out of production analytics.
`apps/<app>/public/_headers` marks `/assets/*` immutable for a year: Workers static
assets otherwise answer `max-age=0, must-revalidate`, so browsers revalidate
every hashed file on every page. The file applies to static assets only, never
to Worker responses.
The server entries wrap the Start handler in `withEarlyHints` (`@repo/utils`): it
reads the rendered `<head>` and sets `Link: rel=preload` headers for the page's
stylesheet and module scripts, which Cloudflare keeps per URL and sends to the
next visitor as a 103 Early Hints before the Worker runs.

The preview database is one shared Neon branch; run the "Reset preview database"
workflow to copy it fresh from production. Preview shares the production R2
bucket. The `avatars` bucket's CORS rule allows `PUT` from
`account.vesact.com` and `account.preview.vesact.com`, the only origins that
uploaded from the browser so far; the account center now uploads from
`studio.preview.vesact.com` (and `jp.vesact.com` in the #121 rehearsal), which
have to be added there or the presigned PUT fails with a CORS error.
The `S3_*` credentials in the studio and account secrets are an account-owned
API token named "vesact avatars bucket (account and studio workers)", scoped to
that bucket: the access key id is the token id, the secret is the SHA-256 hex
of the token value. Rotate by creating a new token the same way
(`POST /accounts/{id}/tokens`), editing the four `<app>.<target>.env` files
with `sops set`, and deploying.

## Docker target

The root `Dockerfile` builds one image per app (`--build-arg APP=<app>` and the
public `VITE_*` URLs, which are inlined into the client bundle): a Node 22
Alpine build stage runs `pnpm install`, `pnpm --filter <app> build:node` and
`pnpm --filter <app> deploy --prod --legacy /app`; the runtime stage runs
`srvx --prod` on port 3000 as the `node` user. `.dockerignore` keeps `.env*`,
`env/`, `secrets/` and `.dev.vars` out of the context.

`docker-compose.prod.yml` is the whole Studio unit: `postgres`, `studio`,
`account`, `marketing` and `caddy`. Caddy owns 80/443, obtains the certificate
for `SITE_ADDRESS`, sends `/account` and `/account/*` to the account container
and everything else on that hostname to studio, serves `MARKETING_ADDRESS` from
the marketing container (`http://localhost:3001` by default, bound to the
loopback interface) and sets `Cache-Control: immutable` on `/assets/*`. The app
containers publish no ports: Docker's published ports bypass ufw, and the
entries trust `X-Forwarded-*`. Runtime variables come from `env/<app>.env`
(gitignored; written from sops on the machine) — the Worker secrets plus what
`wrangler.jsonc` `vars` carried (`VITE_*`, `S3_ENDPOINT`, `S3_REGION`) and
`DATABASE_URL`; `POSTGRES_PASSWORD`, `SITE_ADDRESS` and `MARKETING_ADDRESS`
come from the compose environment (`.env` next to the compose file). Image
names default to `ghcr.io/vesacthq/vesact-<app>:latest`; `STUDIO_IMAGE`,
`ACCOUNT_IMAGE`, `MARKETING_IMAGE` override them. Postgres has no published
port; to migrate or seed from outside, run a throwaway
`alpine/socat` container on the compose network with a port bound to
`127.0.0.1` and tunnel to it over SSH.

CI: the "Docker target" job of `validate-prs.yml` builds the three images,
starts the stack with CI env files and a port override for the schema push,
and runs `.github/scripts/smoke.sh <studio url> <marketing url>` (signed-out
`/` 307, `/account/login` 200, both health endpoints, a 401 from
`sign-in/email` proving the database is reachable, marketing 200). The same
script is the post-deploy check. GHCR creates the packages private; the
machine that pulls them needs them switched to public in the org's package
settings or a `read:packages` token.

The images are 1–1.5 GB unpacked (≈250 MB compressed), mostly production
dependencies that `pnpm deploy` copies for the app, including `next` arriving
as an optional peer of better-auth; trimming them is a separate task.

## Accounts and resources

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
  with a Bypass policy. `api.preview.vesact.com/webhooks` is one, so Meta can
  reach the preview webhook. `account.preview.vesact.com/api/auth` was another,
  from when the products called the auth endpoints cross-origin; the account
  center now answers under `studio.preview.vesact.com/account`, same origin as
  Studio, so that application is unused. `wrangler deploy` adds routes but never
  removes custom domains: `account.preview.vesact.com` and
  `auth.preview.vesact.com` stay attached to `vesact-account-preview` (answering
  404 for the app under its base) until they are detached in the dashboard or
  through the Workers domains API.
  The zone's Bot Fight Mode stays on and cannot be skipped by a WAF rule on
  the Free plan; it challenges curl from the GitHub runner, which is why the
  deploy makes no HTTP check after `wrangler deploy` (the earlier smoke check
  failed with 403 and `cf-mitigated: challenge`). Verify a deploy by hand or
  through Workers versions instead.
- `auth.vesact.com` stays attached to the production account Worker and answers
  with a 301 to the `account.` hostname until #121 retires both.
- Preview hostnames live under `preview.vesact.com` rather than `workers.dev`
  because `workers.dev` is on the Public Suffix List: no cookie can span two
  Workers there, so products could not share a login.
- One Google OAuth client serves every environment; each needs its callback
  `<VITE_ACCOUNT_URL>/api/auth/callback/google` registered in Google Cloud
  (`https://studio.preview.vesact.com/account/api/auth/callback/google`,
  `http://localhost:3004/account/api/auth/callback/google`).
- `vesact.com` and `preview.vesact.com` redirect to their `www` hostnames through
  Cloudflare Redirect Rules on a proxied `AAAA 100::` record each.

## Public URLs

A second product gets its own hostname; the app stays rooted at `/` so that
origin-relative paths in the template keep working.

`VITE_STUDIO_URL`, `VITE_ACCOUNT_URL` and `VITE_MARKETING_URL` are the public URLs
the apps advertise: they drive Better Auth's `baseURL`, the CORS and
trusted-origin lists, links in email, and whether analytics reports. They are
read at build time, so a change needs a rebuild, not just a redeploy.
