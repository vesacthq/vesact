---
name: debugging-a-failing-ci-run
description: "Use when diagnosing a failed GitHub Actions validation job and reproducing its exact pnpm command locally."
---

# Debugging a failing CI run

## Scope

Use for failures in `.github/workflows/validate-prs.yml`. Do not rewrite CI to hide a product failure or retry nondeterministic tests without finding the cause.

## Procedure

1. Identify the failing run and job:
   ```bash
   gh pr checks <pr-number>
   gh run view <run-id>
   gh run view <run-id> --log-failed
   ```
2. Map the job to its exact command: `pnpm verify`, `pnpm type-check`, `pnpm build`, `pnpm test`, or the sequential marketing/SaaS `e2e:ci` commands. `pnpm verify` is marketing generation, Oxlint, then `oxfmt --check`; `pnpm lint` is not equivalent.
3. Compare CI inputs: Node comes from `.nvmrc`, pnpm from root `packageManager`, every job starts with `pnpm install --frozen-lockfile`, and workflow environment variables are declared at the top of `validate-prs.yml`.
4. Reproduce from the repository root with the same command and environment. For E2E, inspect the relevant app's `playwright.config.ts` and the first useful stack/trace, not only the final timeout.
5. Reduce to a focused command after reproducing, such as:
   ```bash
   pnpm --filter @repo/api exec vitest run modules/payments/procedures/list-purchases.test.ts
   pnpm --filter saas exec playwright test e2e/login.spec.ts
   ```
6. For Playwright, note that CI uploads only `apps/saas/playwright-report/` as `playwright-report`; inspect job logs for a marketing failure because its report path is not included in that artifact.
7. Fix the root cause, rerun the focused command, then rerun the original CI command from a clean install when dependency/lockfile state is involved.
8. Check `git diff --check` and `git status --short` for Oxfmt or generated-content drift.

Canonical reference: `.github/workflows/validate-prs.yml`; `apps/saas/playwright.config.ts` documents server reuse and CI retry behavior.

## Done

- The failure is reproducible or explicitly classified as infrastructure-only with log evidence.
- The original failing command passes after the fix.
- No assertion, type gate, or workflow step was weakened merely to make CI green.

## Common mistakes

- Debugging against different Node, pnpm, env, or app ports.
- Running `pnpm lint` when the failed job actually ran `pnpm verify`.
- Treating a downstream E2E cancellation as the primary failure; E2E depends on four earlier jobs.
- Looking for a marketing HTML report in the uploaded artifact when the workflow only includes SaaS.
- Rerunning a flaky job without preserving the failing trace and identifying shared state.
