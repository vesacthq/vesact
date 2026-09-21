---
name: vesact-deploy-and-infra
description: "Use when deploying, debugging deploy.yml or validate-prs.yml, rotating the R2 credentials, or touching the Cloudflare, Neon, Hyperdrive, Access, R2 or DNS resources behind the dev, preview and prod environments."
---

# Deployment and infrastructure

The environment matrix (dev / preview / prod) is in `AGENTS.md` under
"Environments & deployment".

## Hostnames

| App       | prod                                                         | preview                                              |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| marketing | `www.allcast.cc` (`allcast.cc` redirects to it), machine     | `www.preview.vesact.com`                             |
| account   | `studio.allcast.cc/account`, machine (Caddy path split)      | `studio.preview.vesact.com/account` (Workers route)  |
| studio    | `studio.allcast.cc`, machine                                 | `studio.preview.vesact.com`                          |
| relay     | `relay.vesact.com` (console), `api.vesact.com` (API), Worker | `relay.preview.vesact.com`, `api.preview.vesact.com` |

`allcast.cc` is registered at DNSPod (2026-09-13) and its DNS lives there: `@`, `www` and
`studio` are A records to the machine. The ICP filing (`陕ICP备2026025839号-1`) passed on
2026-09-16; until then Tencent Cloud intercepted the domain's traffic to the machine from the
public internet (other ports included) and the stack ran with Caddy's own certificate. Caddy
now gets Let's Encrypt certificates over HTTP-01 on 80; the deploy still smokes from the
machine itself (see "The machine"). `vesact.com` keeps
Relay, `preview.vesact.com`, `e.vesact.com` (PostHog) and the R2 bucket; the `www.`,
`studio.`, `account.` and `auth.` Workers and hostnames were retired on 2026-09-13.

## Deploy pipeline

`deploy.yml`: `select-target.sh` picks the target from the event and
`load-env.sh` decrypts what a job needs into masked environment variables. On a
pull request the marketing, account, studio and relay jobs each build →
`wrangler deploy` → `wrangler secret bulk` to preview; the account job runs the
Studio database migration first and the studio job waits for it; the relay job
migrates Relay's own database (`pnpm --filter @repo/relay db:migrate`) and runs
on its own. On `main` only relay deploys a Worker (its production); studio,
account and marketing go to the machine through the `images` and `machine` jobs
(see "Docker target" and "The machine"). The relay Worker answers on two custom domains and dispatches by
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
workflow to copy it fresh from its parent, the Neon `production` branch (the
pre-move data, kept until it is deleted). Preview shares the production R2
bucket, and so does production on the machine until uploads move to COS after
the filing. The `avatars` bucket's CORS rule allows `PUT` from
`studio.allcast.cc` and `studio.preview.vesact.com`, the origins the account
center uploads from; a new origin has to be added there or the presigned PUT
fails with a CORS error.
The `S3_*` credentials in the studio and account secrets are an account-owned
API token named "vesact avatars bucket (account and studio workers)", scoped to
that bucket: the access key id is the token id, the secret is the SHA-256 hex
of the token value. Rotate by creating a new token the same way
(`POST /accounts/{id}/tokens`), editing the four `<app>.<target>.env` files
with `sops set`, and deploying.

## Docker target

The root `Dockerfile` builds one image per app (`--build-arg APP=<app>` and the
public `VITE_*` URLs, which are inlined into the client bundle): a Node 22
Alpine build stage runs `pnpm install` and `pnpm --filter <app> build:node`, then
copies `.output/` and `node_modules/srvx` into `/app`; the runtime stage runs
`srvx --prod` on port 3000 as the `node` user. There is no production
dependency tree in the image: the node target bundles its server dependencies
(`environments.ssr.resolve.noExternal`), which took the payload from roughly a
gigabyte per app to about 15 MB and is what makes the hand-over to the machine
cheap. `.dockerignore` keeps `.env*`,
`env/`, `secrets/` and `.dev.vars` out of the context.

`docker-compose.prod.yml` is the whole Studio unit: `postgres`, `studio`,
`account`, `marketing` and `caddy`. Caddy owns 80/443, obtains the certificates
for the three addresses (scheme included: `https://studio.allcast.cc`,
`http://localhost` locally), sends `/account` and `/account/*` of
`SITE_ADDRESS` to the account container and everything else on that hostname
to studio, serves `MARKETING_ADDRESS` from the marketing container
(`http://localhost:3001` by default, bound to the loopback interface), answers
`APEX_ADDRESS` with a 301 to the marketing site and sets `Cache-Control:
immutable` on `/assets/*`. The app containers publish no ports: Docker's
published ports bypass ufw, and the entries trust `X-Forwarded-*`. Runtime
variables come from `env/<app>.env` (gitignored; written from sops on the
machine) — the Worker secrets plus what `wrangler.jsonc` `vars` carried
(`VITE_*`, `S3_ENDPOINT`, `S3_REGION`) and `DATABASE_URL`; `POSTGRES_PASSWORD`,
`SITE_ADDRESS`, `MARKETING_ADDRESS` and `APEX_ADDRESS` come
from the compose environment (`.env` next to the compose file). Images are
`${IMAGE_REPO}-<app>:${IMAGE_TAG}`, `vesact` and `latest` by default (CI's
smoke uses `vesact` / `ci`, the machine the commit sha); no registry is
involved, the images reach the machine through R2 (see "The machine"). Postgres is published on the machine's loopback interface only
(`127.0.0.1:5432`); migrations reach it through an SSH tunnel.

CI: the "Docker target" job of `validate-prs.yml` builds the three images,
starts the stack with CI env files and a port override for the schema push,
and runs `.github/scripts/smoke.sh <studio url> <marketing url>` (signed-out
`/` 307, `/account/login` 200, both health endpoints, a 401 from
`sign-in/email` proving the database is reachable, marketing 200; with a
third argument, the machine's deploy also checks that the apex redirects to
the marketing site). The same script is the post-deploy check: run on
the machine, it resolves the public hostnames to the local Caddy
(`--resolve`), so it needs neither DNS nor the domain's 80/443 to be open,
and first waits up to a minute for each hostname to answer TLS, since Caddy
is still obtaining a certificate after a first deploy or a changed issuer.

An image is about 250 MB unpacked and 58 MiB through `docker save | zstd -3`,
of which `node:22-alpine` is 232 MB: the app's own layer is roughly 17 MB, so
the base is now the bulk of every transfer. Taking it off the wire as well
means letting the machine pull it from `mirror.ccs.tencentyun.com` and
assembling the image there, which is #166's remaining item.

## The machine

Production is one Tencent Cloud CVM in Shanghai (`118.89.171.81`, SA3.MEDIUM2:
2 vCPU, 2 GB, 50 GB, Ubuntu 24.04). `ssh ubuntu@118.89.171.81` with your own
key (password login and root login are off; `ubuntu` has passwordless sudo and
is in the docker group); CI uses the ed25519 key in
`secrets/files/machine-deploy-ssh-key.json`, whose public half is in
`~ubuntu/.ssh/authorized_keys`, against the host key pinned in
`.github/machine_known_hosts`. Rotate it by generating a new pair, replacing the
line in `authorized_keys`, and re-encrypting the private key with
`sops --encrypt --input-type binary --output-type json`. Docker Engine comes
from `mirrors.cloud.tencent.com/docker-ce`; `/etc/docker/daemon.json` points
Docker Hub pulls at `mirror.ccs.tencentyun.com` (Docker Hub, github.com and
Google are unreachable from the machine; ghcr.io is too slow to use). ufw
allows 22, 80 and 443; the security group mirrors that. 2 GB of RAM is enough
to run the stack, never to build it — images are built in CI.

Everything lives in `/srv/vesact/`: `docker-compose.prod.yml`, `Caddyfile`,
`machine-deploy.sh`, `smoke.sh`, `machine-prune.sh`, `.env` (from
`secrets/prod.env`: `SITE_ADDRESS`, `MARKETING_ADDRESS`, `APEX_ADDRESS`,
`POSTGRES_PASSWORD`, plus `IMAGE_TAG` maintained by the
deploy script), `env/<app>.env` (from `secrets/<app>.prod.env`) and
`current-tag`. The `machine` job of `deploy.yml` rewrites all of them from the
repository on every push to `main` and installs `machine-prune.sh` as
`/etc/cron.weekly/vesact-prune`, so edit the sops files, not the machine.

Deploy: each `images` job builds `vesact-<app>:<sha>`, uploads
`docker save | zstd` of it to the R2 bucket `vesact-images` (objects expire
after 7 days; credentials `R2_*` in `secrets/ci.env`, a token scoped to that
bucket) and has the machine download it with a presigned URL from Cloudflare's
edge (~10 MB/s) into `docker load`, falling back to piping the file down the
SSH session; then
`machine` starts
`postgres` if needed, migrates through `ssh -L` (`secrets/database.prod.env`
points at the tunnel), copies the files and runs
`./machine-deploy.sh <sha> https://studio.allcast.cc https://www.allcast.cc https://allcast.cc`:
checks the three images are present, `up -d --wait`, `smoke.sh`; a failed
smoke brings the previous tag back and fails the job. The script keeps the
images of the running tag and its predecessor and removes older ones; the
weekly cron removes untagged layers, stopped containers and journal beyond
200 MB. Roll back by hand to the predecessor with
`cd /srv/vesact && IMAGE_TAG=<sha> docker compose -f docker-compose.prod.yml up -d --wait`
(`docker image ls` shows the two tags), then
`./smoke.sh https://studio.allcast.cc https://www.allcast.cc https://allcast.cc`
and write the tag to `current-tag` and `IMAGE_TAG` in `.env`. Logs:
`docker compose -f docker-compose.prod.yml logs -f <service>` (json-file,
3 × 10 MB per container). The database is the `postgres` container's volume
`vesact_postgres_data`; nothing backs it up yet (a nightly dump to COS is the
first thing to add once there is data worth keeping). The Neon `production`
branch still holds the pre-move data; its URL is `NEON_PRODUCTION_DATABASE_URL`
in `secrets/infra.env`.

The ICP filing number (`陕ICP备2026025839号-1`, `allcast.cc`, approved 2026-09-16)
is `VITE_ICP_FILING_NUMBER` in the `images` job's build args: the marketing footer
and the account center's auth pages link it to `beian.miit.gov.cn` when set, and
nothing else (preview, a future overseas build) sets it. The rule (Tencent Cloud doc
243/61412): the number at the bottom of the homepage, linked to that site, with both
`allcast.cc` and `www.` reachable; the login page carries it for `studio.`. The
public-security filing (`beian.mps.gov.cn`) is due within 30 days of going live.
`VITE_PLACEHOLDER_SITE_NAME` in the same build args (the filed site name, the
company's legal name) makes the marketing build one placeholder page with that
name, the © line and the filing number, every other path redirecting to it:
the filed content is a company site and the Allcast site does not exist yet, so
the template landing page must not show there. Unset it when that site ships.

Still deferred from the filing interim (#156): uploads to COS instead of R2,
a nightly dump to COS, mail and brand on `allcast.cc`, the domestic login
methods (Google login is off in production: the machine cannot reach Google's
token endpoint).

## Accounts and resources

- Cloudflare account `6a8e5373d12070c930f09f1a82541a0b`, workers.dev subdomain
  `vesact`. CI authenticates with the token in `secrets/ci.env`; manual
  operations use `wrangler login`.
- Neon project `ancient-morning-26822519` (`vesact`, Singapore) for the Studio
  unit's preview: branch `preview`, whose parent `production` (default) holds
  the data from before the move to the machine and stays because a root branch
  cannot be deleted; Neon
  project `purple-breeze-98513221` (`vesact-relay`, Singapore, Postgres 18) for
  Relay, same two branches, migrated by `@repo/relay` with the URLs in
  `secrets/relay-database.<env>.env`. Manage them with `neonctl` and
  `NEON_API_KEY` from `secrets/ci.env`; `secrets/infra.env` holds the Neon
  and Cloudflare tokens that create projects and Hyperdrive configs — CI never
  loads it.
- Hyperdrive `vesact-preview` for studio and account (its id is the one
  binding in `apps/studio/wrangler.jsonc`, top level and preview alike, since
  production left Workers and `vesact-db` was deleted on 2026-09-13) points at
  the `vesact` project; `vesact-relay-db` and `vesact-relay-preview` for relay
  (ids in `apps/relay/wrangler.jsonc`) point at `vesact-relay`. All three have query caching
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
  `auth.preview.vesact.com` were detached from `vesact-account-preview` through
  the Workers domains API on 2026-09-13; a hostname that comes back after a
  deploy has to be detached the same way.
  The zone's Bot Fight Mode stays on and cannot be skipped by a WAF rule on
  the Free plan; it challenges curl from the GitHub runner, which is why the
  deploy makes no HTTP check after `wrangler deploy` (the earlier smoke check
  failed with 403 and `cf-mitigated: challenge`). Verify a deploy by hand or
  through Workers versions instead.
- Preview hostnames live under `preview.vesact.com` rather than `workers.dev`
  because `workers.dev` is on the Public Suffix List: no cookie can span two
  Workers there, so products could not share a login.
- One Google OAuth client serves every environment that has Google login
  (production has none); each needs its callback registered in Google Cloud:
  `<VITE_ACCOUNT_URL>/api/auth/callback/google` for the account center
  (`https://studio.preview.vesact.com/account/api/auth/callback/google`,
  `http://localhost:3004/account/api/auth/callback/google`) and
  `<VITE_RELAY_URL>/api/auth/callback/google` for Relay
  (`https://relay.vesact.com/...`, `https://relay.preview.vesact.com/...`,
  `http://localhost:3005/...`).
- `vesact.com` and `preview.vesact.com` redirect to their `www` hostnames through
  Cloudflare Redirect Rules on a proxied `AAAA 100::` record each; since
  `www.vesact.com` was retired the `vesact.com` rule points at nothing until it
  is repointed or removed.

## Public URLs

A second product gets its own hostname; the app stays rooted at `/` so that
origin-relative paths in the template keep working.

`VITE_STUDIO_URL`, `VITE_ACCOUNT_URL` and `VITE_MARKETING_URL` are the public URLs
the apps advertise: they drive Better Auth's `baseURL`, the CORS and
trusted-origin lists, links in email, and whether analytics reports. They are
read at build time, so a change needs a rebuild, not just a redeploy.
