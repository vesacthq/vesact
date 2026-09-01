---
name: local-environment-setup
description: "Use when bootstrapping the TanStack Start monorepo locally with pnpm, PostgreSQL, optional MinIO, and root Vite environment variables."
---

# Local environment setup

## Scope

Use for a fresh clone or broken local prerequisites. Do not provision cloud resources or commit `.env.local`.

## Procedure

1. Use Node `22` from `.nvmrc` (the engine allows `>=22`) and pnpm `11.3.0` from root `packageManager`; let Corepack/pnpm honor that declaration.
2. Create local configuration:
   ```bash
   cp .env.local.example .env.local
   openssl rand -hex 32
   ```
   Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/flint`, paste the generated value into `BETTER_AUTH_SECRET`, and keep `VITE_SAAS_URL`, `VITE_MARKETING_URL`, and `VITE_DOCS_URL` at `3000`, `3001`, and `3002`. Leave provider values blank unless exercising that integration.
3. Start PostgreSQL and wait for its health check:
   ```bash
   docker compose up -d postgres
   docker compose ps postgres
   ```
4. Start `minio` and `minio-setup` only for storage work:
   ```bash
   docker compose up -d minio minio-setup
   ```
   Use the commented MinIO values in `.env.local.example`; the compose setup creates the `avatars` bucket.
5. Install exactly as CI does:
   ```bash
   pnpm install --frozen-lockfile
   ```
6. Apply the current PostgreSQL Drizzle schema for disposable local development:
   ```bash
   pnpm --filter @repo/database push
   ```
7. Start all workspace development tasks with `pnpm dev`. The SaaS and marketing Vite configs load env from the monorepo root and use `PORT` overrides; docs is fixed to `3002`.
8. Check SaaS at `http://localhost:3000`, marketing at `http://localhost:3001`, and docs at `http://localhost:3002`; the optional mail preview is `http://localhost:3003`.
9. Smoke-check the live API with `curl -sf http://localhost:3000/api/health`; it must return `OK`.

Canonical references: `.env.local.example`, `docker-compose.yml`, `apps/saas/vite.config.ts`, `apps/marketing/vite.config.ts`, and `packages/database/drizzle/client.ts`.

## Done

- PostgreSQL is healthy, dependencies match the lockfile, required app URLs load, and SaaS `/api/health` returns `OK`.
- `.env.local` remains untracked and contains no placeholder auth/database values.

## Common mistakes

- Putting `.env.local` under an app; the SaaS and marketing Vite configs use the monorepo root as `envDir`.
- Exposing a secret with a `VITE_` prefix.
- Starting MinIO without `minio-setup` and then debugging a missing bucket.
- Running migration generation merely to initialize a disposable local database.
- Assuming the Playwright SaaS port `3100` is the normal development port; `pnpm dev` uses `3000`.
