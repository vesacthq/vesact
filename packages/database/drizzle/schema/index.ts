// The Drizzle queries and generated Zod schemas in `@repo/database` are written
// against the PostgreSQL schema. Re-export it here so consumers that import
// `@repo/database/drizzle/schema` (or via `../schema` from queries) see the
// postgres tables by default. If you adopt a different dialect, swap the
// re-export and update `drizzle.config.ts` and `client.ts` accordingly.
export * from "./postgres";
