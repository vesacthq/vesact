---
name: add-orpc-procedure
description: "Use when adding a typed oRPC endpoint, router entry, authorization middleware, and TanStack Query client integration."
---

# Add an oRPC procedure

## Scope

Use for application API operations exposed through Hono/oRPC. Do not use for Better Auth endpoints, payment webhooks, or route-local server loading better served by `createServerFn`.

## Procedure

1. Create the procedure under `packages/api/modules/<domain>/procedures/<name>.ts`.
2. Choose `publicProcedure`, `protectedProcedure`, or `adminProcedure` from `packages/api/orpc/procedures.ts`. Add domain authorization inside the handler; authentication alone does not grant organization access.
3. Chain `.route()` (HTTP method/path/tags), `.input()` with Zod 4, `.output()`, and `.handler()`. Use `ORPCError` codes for expected API failures.
4. Keep database access in `@repo/database`; add a query under `packages/database/drizzle/queries/` instead of using Drizzle in the procedure.
5. Register the procedure in `packages/api/modules/<domain>/router.ts`; register a new domain in `packages/api/orpc/router.ts`. `packages/api/index.ts` serves RPC under `/api/rpc` and OpenAPI routes under `/api`.
6. Consume it through `orpc` from `apps/saas/modules/shared/lib/orpc-query-utils.ts`:
   ```ts
   useQuery(orpc.notifications.getPreferences.queryOptions());
   useMutation(orpc.payments.createCheckoutLink.mutationOptions());
   ```
7. Add a colocated Vitest test using `call(procedure, input, { context: { headers: new Headers() } })`; mock auth/data/provider boundaries and prove validation/authorization prevents effects.
8. Run:
   ```bash
   pnpm --filter @repo/api test
   pnpm lint
   pnpm type-check
   ```

Canonical references: `packages/api/modules/organizations/procedures/create-logo-upload-url.ts`, `packages/api/modules/organizations/router.ts`, `packages/api/orpc/router.ts`, and `packages/api/modules/payments/procedures/create-checkout-link.test.ts`.

## Done

- Route metadata, Zod input/output, correct auth level, router registration, and client integration are present.
- Focused API tests, lint, and type-check pass.

## Common mistakes

- Treating `protectedProcedure` as sufficient organization authorization.
- Returning an undocumented shape without `.output()`.
- Importing the raw oRPC client into React Query code when query utilities provide keys/options.
- Editing `apps/saas/routes/api/$.ts` for each procedure; its catch-all already forwards all supported methods to Hono.
