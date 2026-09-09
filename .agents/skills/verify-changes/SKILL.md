---
name: verify-changes
description: "Use when validating a repository change against Supastarter's formatting, lint, type-check, build, Vitest, and Playwright gates."
---

# Verify changes

## Scope

Use this after implementation or while preparing a PR. Do not use it to decide product behavior or to replace feature-specific tests.

## Procedure

1. Inspect the change with `git status --short`, `git diff --stat`, and `git diff --check`; map changed paths to affected workspaces.
2. Apply the repository's mandatory local write/check pair:
   ```bash
   pnpm format
   pnpm lint
   ```
   `pnpm format` is Oxfmt write mode; `pnpm lint` is Oxlint only. CI instead runs the non-writing aggregate `pnpm verify`, exactly `pnpm --filter marketing run generate && oxlint && oxfmt --check`.
3. From a clean checkout of the commit being reviewed, reproduce every CI job's install before its command:
   ```bash
   pnpm install --frozen-lockfile
   ```
   A warm working tree or existing `node_modules` does not prove the lockfile installs in CI.
4. Run the non-browser CI commands from the repository root:
   ```bash
   pnpm verify
   pnpm type-check
   pnpm build
   pnpm test
   ```
   These are four independent CI jobs. `pnpm verify` generates marketing content before checking Oxlint and Oxfmt. Root unit tests currently run only in `apps/studio` and `packages/api`.
5. During iteration, run focused tests first:
   ```bash
   pnpm --filter @repo/api exec vitest run modules/payments/procedures/create-checkout-link.test.ts
   pnpm --filter studio exec vitest run modules/auth/lib/redirects.test.ts
   ```
6. Run both app-scoped browser suites when matching CI or before declaring a PR fully verified:
   ```bash
   pnpm --filter marketing e2e:ci
   pnpm --filter studio e2e:ci
   ```
   They install Playwright browsers and run headlessly. During local iteration, E2E may be skipped only for changes that cannot affect routes, rendering, auth, API/database behavior, runtime config, or shared UI; record that rationale. CI still requires both suites and a reachable `DATABASE_URL`.
7. Review `git status --short` after generation. Never hand-edit `apps/*/routeTree.gen.ts` or `apps/marketing/.content-collections/`.

Canonical reference: `.github/workflows/validate-prs.yml` defines the authoritative CI jobs and ordering.

## Failure guide

| Failure                                              | Fix                                                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Frozen install reports an outdated lockfile          | Run the intended `pnpm add`/`pnpm install` to update `pnpm-lock.yaml`, review it, then retry frozen install.                      |
| Install cannot resolve a just-released version       | Use a version admitted by `minimumReleaseAge: 1440`; use an existing `catalog:` entry when shared. Do not bypass policy casually. |
| Manifest uses `catalog:` but catalog entry is absent | Add the shared version under `catalog` in `pnpm-workspace.yaml`, regenerate the lockfile, and retry.                              |
| `pnpm verify` changes/fails on generated content     | Run `pnpm --filter marketing generate`, fix source content/config, and never edit `.content-collections` output.                  |
| `oxfmt --check` fails                                | Run `pnpm format`, inspect the diff, then rerun `pnpm verify`; `pnpm lint` cannot fix formatting.                                 |
| Oxlint, type, build, unit, or E2E fails              | Fix the first actionable error, rerun a focused command, then rerun the original root/app CI command.                             |

## Done

- Clean-checkout `pnpm install --frozen-lockfile` succeeds.
- `pnpm verify`, `pnpm type-check`, `pnpm build`, and `pnpm test` pass.
- Required E2E passes, or a narrowly skippable local omission is stated without claiming full CI parity.
- `git diff --check` passes and status contains no accidental generated/unrelated files.

## Common mistakes

- Running a nonexistent root `e2e` script instead of app-scoped scripts.
- Treating `pnpm lint` as lint-and-format parity; only `pnpm verify` matches that CI job.
- Reusing installed dependencies instead of proving the frozen lockfile from a clean checkout.
- Hand-editing generated route trees or content collections.
- Reporting a pre-existing failure as caused by the change without reproducing it on the base revision.
