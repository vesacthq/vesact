---
name: writing-e2e-tests
description: "Use when adding or updating Playwright end-to-end coverage for the marketing, account, or Studio TanStack Start applications."
---

# Writing E2E tests

## Scope

Use for browser-visible workflows across routing, forms, authentication, or API boundaries. Do not use Playwright for isolated functions that belong in Vitest.

## Procedure

1. Put marketing specs in `apps/marketing/tests/*.spec.ts`, account specs in `apps/account/e2e/*.spec.ts`, and Studio specs in `apps/studio/e2e/*.spec.ts`.
2. Read the matching config; the apps intentionally differ:
   - Marketing: `testDir: "./tests"`, builds then starts on `3001`, and reuses an existing server outside CI.
   - Account: `testDir: "./e2e"`, starts `vite dev` on the port and path `VITE_ACCOUNT_URL` names (`PW_PORT` overrides the port), and reuses only when `PW_REUSE_SERVER=1`; ports and relative spec paths are in the "Tests" section of the `vesact-secrets-and-local-env` skill.
   - Studio: `testDir: "./e2e"`, starts `vite dev` on `PW_PORT` or `3100`, and reuses only when `PW_REUSE_SERVER=1`.
   - All three load root `.env.local`, run Chromium, retain video on failure, trace on first retry, and use one worker plus one retry in CI.
3. Start from a user-observable state with `page.goto()`. Prefer `getByRole`/`getByLabel`; use an existing stable test attribute only when accessibility locators cannot express the target.
4. Assert hydration before client interaction. Wait for a control that is absent from SSR HTML — `apps/account/e2e/login.spec.ts` waits for the Language button (`LocaleSwitch` returns null until `useIsClient()`). Do not treat `[data-test="color-mode-toggle"]` as hydration; that wrapper is server-rendered.
5. Keep tests independent and provision/clean required PostgreSQL state explicitly. CI's e2e job starts Postgres and MinIO with `docker compose` and pushes the schema before the suites run.
6. Treat authentication setup accurately: in the account suite, `e2e/auth.setup.ts` seeds isolated users from `e2e/fixtures/users.ts` straight into the database, signs them in, and saves their storage state under the gitignored `e2e/.auth/`; the `chromium` project depends on that `setup` project, and specs choose a user with `test.use({ storageState: e2eUsers.<user>.statePath })`. The Studio suite only tests signed-out redirects to the account center; authenticated Studio tests need the same kind of setup file and setup-project dependency. Do not rely on a developer session. Marketing declares a `setup` project matching `*.setup.ts`, but currently has no setup file or Chromium dependency on it; Studio declares no setup project.
7. Run a focused spec headlessly:
   ```bash
   pnpm --filter marketing exec playwright test tests/home.spec.ts
   pnpm --filter account exec playwright test e2e/login.spec.ts
   pnpm --filter studio exec playwright test e2e/login.spec.ts
   ```
8. Use UI mode only for local debugging:
   ```bash
   pnpm --filter marketing e2e
   pnpm --filter account e2e
   pnpm --filter studio e2e
   ```
   These scripts pass `--ui`. The CI scripts install browsers and run headlessly:
   ```bash
   pnpm --filter marketing e2e:ci
   pnpm --filter account e2e:ci
   pnpm --filter studio e2e:ci
   ```
9. CI runs all three suites after lint, type, build, and unit jobs. Its `playwright-report` artifact uploads each app's `playwright-report/` plus `test-results/` for account and Studio. If report coverage changes, update `.github/workflows/validate-prs.yml` deliberately.
10. E2E is required for route/rendering/form/auth/API/database/runtime/shared-UI changes and for full PR parity. A local E2E run may be skipped for isolated docs, comments, or server utility changes with focused unit coverage, but state the omission; CI still runs all three suites.

Canonical references: `apps/marketing/tests/home.spec.ts`, `apps/account/e2e/auth.setup.ts`, `apps/account/e2e/admin.spec.ts`, `apps/studio/e2e/login.spec.ts`, and the three apps' `playwright.config.ts` files.

## Done

- The focused spec and required app `e2e:ci` command pass.
- Auth/data setup is isolated, locators describe user-visible UI, and the test is parallel-safe.
- CI report expectations match the workflow; any local skip has a narrow recorded reason.

## Common mistakes

- Running `pnpm e2e:ci` at the repository root; no root script exists.
- Starting a second server manually when Playwright `webServer` already owns it.
- Setting `PW_REUSE_SERVER=1` against an unknown process and testing the wrong app.
- Assuming a declared setup project automatically authenticates tests without a setup file and dependency.
- Using sleeps instead of web-first assertions.
