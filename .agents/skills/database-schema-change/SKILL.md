---
name: database-schema-change
description: "Use when changing the active PostgreSQL Drizzle schema, generated Zod models, query layer, or generated migration artifacts."
---

# Database schema change

## Scope

Use for persistent model, relation, enum, index, or constraint changes. This repository is Drizzle-only; do not introduce Prisma or hand-edit generated migrations.

## Procedure

1. Edit the active source of truth at `packages/database/drizzle/schema/postgres.ts`. PostgreSQL is selected independently by:
   - `packages/database/drizzle/schema/index.ts` (package schema barrel)
   - `packages/database/drizzle/client.ts` (`drizzle-orm/node-postgres`)
   - `packages/database/drizzle.config.ts` (`dialect: "postgresql"` and migration output)
   - every file under `packages/database/drizzle/queries/`, which imports PostgreSQL tables
2. Treat `packages/database/drizzle/schema/mysql.ts` and `packages/database/drizzle/schema/sqlite.ts` as shipped alternate-dialect starting points, not active mirrors. They are not exported, connected, used by queries/Zod, or selected by migration config, and currently differ from PostgreSQL. A dialect switch must update the barrel, driver/dependencies, Drizzle config, all dialect-specific query imports/operations, Zod compatibility, and Better Auth adapter provider together.
3. Define foreign-key deletion behavior, indexes, unique constraints, defaults, nullability, and `relations()` deliberately. Keep tenant keys such as `organizationId` explicit and indexed.
4. Update `packages/database/drizzle/zod.ts` when consumers need select/insert/update schemas. Add data access under `packages/database/drizzle/queries/` and export it from `packages/database/drizzle/queries/index.ts`; keep Drizzle out of app components and oRPC handlers.
5. Use the scripts defined by `packages/database/package.json`:
   - `push`: diff the active schema directly against a disposable local database.
   - `db:generate`: generate migration SQL and metadata under `packages/database/drizzle/migrations/`.
   - `db:migrate`: apply already-generated migrations to `DATABASE_URL`.
   - `db:studio`: inspect the configured database.
6. For disposable local synchronization only:
   ```bash
   pnpm --filter @repo/database push
   ```
7. For a reviewable, deployable change, generate from the schema:
   ```bash
   pnpm --filter @repo/database db:generate
   ```
   Inspect the generated SQL/metadata for destructive changes and locks. Correct the schema and regenerate instead of editing generated artifacts. Commit the generated migration; do not generate an empty migration or use `push` as a production migration.
8. Apply it only to the intended local/test database:
   ```bash
   pnpm --filter @repo/database db:migrate
   ```
   For non-null/destructive changes, plan expand/backfill/contract ordering before migration.
9. Test affected queries/procedures, then run:
   ```bash
   pnpm --filter @repo/database type-check
   pnpm --filter @repo/api test
   pnpm lint
   pnpm type-check
   ```

Canonical references: `notification` and `userNotificationPreference` plus their relations in `packages/database/drizzle/schema/postgres.ts`; `packages/database/drizzle/queries/notifications.ts`; and `packages/database/drizzle.config.ts`.

## Done

- Active PostgreSQL schema, relations, Zod exports, query layer, and migration agree.
- Generated artifacts are reviewed, committed, and applied to the intended test database.
- Backfill and rollout implications are documented for non-null/destructive changes.

## Common mistakes

- Updating `sqlite.ts` or `mysql.ts` as though all three schemas are synchronized and active.
- Using Prisma commands or expecting a Prisma schema; this repository is Drizzle-only.
- Treating `db:generate` as applying a migration, or using `push` in production.
- Hand-editing generated SQL/metadata instead of fixing the PostgreSQL schema and regenerating.
- Adding a tenant-owned table without an organization/user index and scoped query.
