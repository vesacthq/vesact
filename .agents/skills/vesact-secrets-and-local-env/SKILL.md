---
name: vesact-secrets-and-local-env
description: "Use when running this repo locally, reading or editing the sops secrets under secrets/, wiring .env.local or .dev.vars, starting Postgres or MinIO, creating the first user, or running the Playwright suites."
---

# Secrets and local environment

## Secrets

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

## Local configuration

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

## Local services

Start the local services with:

```bash
docker compose up -d postgres
```

The `postgres` service is PostgreSQL 16, published on host port 5433. The compose file also defines
MinIO (`minio` and `minio-setup`) for S3-compatible storage when storage features are used.

## Install and run

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the workspace dev tasks through Turbo.

## Running locally

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

## Tests

The root test task runs Vitest in `apps/account`, `apps/marketing`, `apps/studio`,
`packages/api`, `packages/permissions` and `packages/utils`. Playwright tests are in
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
