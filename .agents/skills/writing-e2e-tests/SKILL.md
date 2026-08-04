---
name: writing-e2e-tests
description: "Use when adding or updating Playwright end-to-end coverage for the marketing or SaaS TanStack Start applications."
---

# Writing E2E tests

## Scope

Use for browser-visible workflows across routing, forms, authentication, or API boundaries. Do not use Playwright for isolated functions that belong in Vitest.

## Procedure

1. Put marketing specs in `apps/marketing/tests/*.spec.ts` and SaaS specs in `apps/saas/e2e/*.spec.ts`.
2. Read the matching config; the apps intentionally differ:
   - Marketing: `testDir: "./tests"`, builds then starts on `3001`, and reuses an existing server outside CI.
   - SaaS: `testDir: "./e2e"`, starts `vite dev` on `PW_PORT` or `3100`, and reuses only when `PW_REUSE_SERVER=1`.
   - Both load root `.env.local`, run Chromium, retain video on failure, trace on first retry, and use one worker plus one retry in CI.
3. Start from a user-observable state with `page.goto()`. Prefer `getByRole`/`getByLabel`; use an existing stable test attribute only when accessibility locators cannot express the target.
4. Assert hydration before client interaction. `apps/saas/e2e/login.spec.ts` waits for the `System mode` button before switching auth tabs.
5. Keep tests independent and provision/clean required PostgreSQL state explicitly. CI supplies `DATABASE_URL`; it does not start a database service.
6. Treat authentication setup accurately: there is currently no auth setup fixture or saved `storageState`; the SaaS suite only tests the public login page. For authenticated tests, add a deterministic setup spec/API helper and isolated user, save storage state without secrets, and wire a Playwright setup-project dependency. Do not rely on a developer session. Marketing declares a `setup` project matching `*.setup.ts`, but currently has no setup file or Chromium dependency on it; SaaS declares no setup project.
7. Run a focused spec headlessly:
   ```bash
   pnpm --filter marketing exec playwright test tests/home.spec.ts
   pnpm --filter saas exec playwright test e2e/login.spec.ts
   ```
8. Use UI mode only for local debugging:
   ```bash
   pnpm --filter marketing e2e
   pnpm --filter saas e2e
   ```
   These scripts pass `--ui`. The CI scripts install browsers and run headlessly:
   ```bash
   pnpm --filter marketing e2e:ci
   pnpm --filter saas e2e:ci
   ```
9. CI runs both suites after lint, type, build, and unit jobs. Its `playwright-report` artifact currently uploads only `apps/saas/playwright-report/`, although marketing also writes an HTML report in its app directory. If report coverage changes, update `.github/workflows/validate-prs.yml` deliberately.
10. E2E is required for route/rendering/form/auth/API/database/runtime/shared-UI changes and for full PR parity. A local E2E run may be skipped for isolated docs, comments, or server utility changes with focused unit coverage, but state the omission; CI still runs both suites.

Canonical references: `apps/marketing/tests/home.spec.ts`, `apps/saas/e2e/login.spec.ts`, and both app `playwright.config.ts` files.

## Done

- The focused spec and required app `e2e:ci` command pass.
- Auth/data setup is isolated, locators describe user-visible UI, and the test is parallel-safe.
- CI report expectations match the workflow; any local skip has a narrow recorded reason.

## Common mistakes

- Running `pnpm e2e:ci` at the repository root; no root script exists.
- Starting a second server manually when Playwright `webServer` already owns it.
- Setting `PW_REUSE_SERVER=1` against an unknown process and testing the wrong app.
- Assuming a declared setup project automatically authenticates tests without a setup file and dependency.
- Assuming CI uploads the marketing HTML report; it currently uploads only the SaaS report path.
- Using sleeps instead of web-first assertions.
