---
name: writing-unit-tests
description: "Use when adding Vitest unit or procedure tests for Studio modules and the shared oRPC API package."
---

# Writing unit tests

## Scope

Use for deterministic functions, authorization boundaries, schemas, and oRPC handlers. Do not use it for full browser journeys or external provider integration tests.

## Procedure

1. Co-locate `*.test.ts` beside the implementation. Existing Vitest workspaces are `apps/studio` and `packages/api`.
2. Test behavior at the narrowest public boundary. For an oRPC procedure, call the exported procedure itself:
   ```ts
   import { call } from "@orpc/server";

   const context = { context: { headers: new Headers() } };
   const result = await call(procedure, input, context);
   ```
   The outer `context` option is required because `publicProcedure` declares `{ headers: Headers }`; `protectedProcedure` then calls `auth.api.getSession({ headers })` and adds `user`/`session`.
3. Declare `vi.mock()` factories before importing mocked exports and the procedure. Vitest hoists these calls, but keeping imports after factories makes the boundary explicit. Mock `@repo/auth`, `@repo/database`, providers, and membership helpers; keep real oRPC middleware, Zod input/output, and handler code.
4. Return a typed auth fixture with `satisfies Session`, configure with `vi.mocked(auth.api.getSession).mockResolvedValue(...)`, and use `vi.mocked()` for dependency behavior. Reset calls/implementations with `vi.clearAllMocks()` in `beforeEach`.
5. Cover success, invalid input, unauthenticated/forbidden paths, provider failures, and side-effect suppression as applicable. Assert denied calls do not reach database/provider mutations.
6. For pure helpers, avoid an oRPC context; test exported behavior directly. `apps/studio/vitest.config.ts` excludes `e2e/**`, so do not import Playwright specs into Vitest.
7. Run the exact test:
   ```bash
   pnpm --filter @repo/api exec vitest run modules/payments/procedures/create-checkout-link.test.ts
   pnpm --filter studio exec vitest run modules/auth/lib/redirects.test.ts
   ```
8. Run the owning workspace test, then `pnpm test` for shared behavior or CI parity. The root Turbo task currently discovers tests only where a workspace defines `test`: `apps/studio` and `packages/api`.

Canonical references: `packages/api/modules/payments/procedures/create-checkout-link.test.ts` demonstrates `call`, typed session/context, hoisted dependency mocks, authorization, and suppressed effects; `packages/api/modules/ai/procedures/stream-message.test.ts` demonstrates validation rejection.

## Done

- Focused and relevant workspace tests pass.
- Assertions prove returned values/errors, auth/membership behavior, and important calls that must or must not happen.
- Tests do not require real provider credentials or mutable external services.

## Common mistakes

- Importing the subject before `vi.mock()` is established.
- Passing `{ headers }` directly instead of `{ context: { headers } }` to `call`.
- Mocking the procedure itself instead of its dependencies.
- Mocking away Zod or protected-procedure middleware and no longer testing the public boundary.
- Adding tests to a package without a `test` script and assuming the root Turbo task discovers them.
