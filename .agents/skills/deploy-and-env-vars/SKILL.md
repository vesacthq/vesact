---
name: deploy-and-env-vars
description: "Use when changing environment variables or secrets, adding a deploy target, or inspecting how preview and production get built and deployed on Cloudflare Workers."
triggers: ["user"]
---

# Deploy and environment variables

Environments and the deploy pipeline are defined in `AGENTS.md` under
"Environments & deployment"; this skill is the procedure.

## Steps

1. Decide where the value belongs. Public build-time values (`VITE_*`) live in
   `.github/scripts/select-target.sh` per target and, for the Worker runtime, in
   the `vars` of `apps/<app>/wrangler.jsonc` (`env.preview.vars` for preview).
   Anything secret goes in `secrets/<file>.env`, never in `wrangler.jsonc`,
   workflow files, or GitHub secrets.
2. Edit a secrets file with `sops secrets/<file>.env`. Worker secrets belong in
   `<app>.<target>.env` (`studio`, `account`, `relay`), migration URLs in
   `database.<target>.env`, CI-only credentials in `ci.env`, local values in
   `<app>.dev.env`. Commit the encrypted file; `deploy.yml` syncs Worker
   secrets on the next deploy.
3. After changing an `<app>.dev.env`, run `pnpm secrets:pull` so the app's
   `.dev.vars` matches.
4. After changing `wrangler.jsonc`, run `pnpm --filter <app> exec wrangler types`
   if bindings changed, then `pnpm type-check`.
5. Verify locally with the same build the pipeline uses:
   `CLOUDFLARE_ENV=preview pnpm --filter <app> build` for preview, plain
   `pnpm --filter <app> build` for production, then
   `pnpm --filter <app> exec wrangler deploy --dry-run`.
6. Open a pull request; the preview deploy is the check. Production deploys
   only from `main`.

## Adding an app or a preview target

1. `env.preview` in the app's `wrangler.jsonc`: `workers_dev: false`, a
   `custom_domain` route on `<app>.preview.vesact.com`, its own `vars`, its own
   bindings. Attach the hostname to the Worker in the dashboard or through the
   API before the first deploy; the certificate takes a few minutes and the
   smoke check will not wait for it.
2. Its URLs in `.github/scripts/select-target.sh`, and a job in `deploy.yml`
   modelled on the studio one.
3. Secrets files under `secrets/` for the new Worker and, if it has a database,
   a Neon branch, a Hyperdrive config and a `database.<target>.env`.
4. The Google OAuth callback for the new `VITE_ACCOUNT_URL`, if it signs users in.
5. Nothing for Access: the `*.preview.vesact.com` application already covers
   the hostname. A path that outside services must reach (a webhook) needs its
   own, more specific application with a Bypass policy.

## Pitfalls

- `vars` and bindings are not inherited by `env.preview`; redeclare them.
- The session cookie domain is derived from `VITE_ACCOUNT_URL`; there is no
  variable for it. Only the preview cookie prefix (`AUTH_COOKIE_PREFIX`) is set
  by hand.
- The account Worker uploads avatars and logos, so `secrets/account.<target>.env`
  carries the same `S3_*` keys as the studio file. `secrets/relay.<target>.env`
  is the studio file without `S3_*`, plus the Meta app secret and webhook verify
  token; `BETTER_AUTH_SECRET` must match the other Workers or sessions are not
  shared.
- The relay Worker has two custom domains per environment (`relay.` and `api.`);
  both routes go in the same `routes` array, and both hostnames need attaching
  before the first deploy.
- `CLOUDFLARE_ENV` selects the environment at build time; `wrangler deploy` takes
  no `--env` because the Vite plugin already flattened the config.
- Preview builds must not carry `VITE_POSTHOG_KEY`.
- A new Worker has no secrets until the first `wrangler secret bulk`; the
  pipeline runs it right after deploy.
- Adding a recipient: add the age public key to `.sops.yaml`, then
  `sops updatekeys secrets/*.env`.
- Anything a browser calls cross-origin on preview (`account.preview`, a future
  `api.preview` used from another hostname) needs its own Access application
  with a Bypass policy: Access rejects CORS preflights and its cookie does not
  carry over to a second hostname.
