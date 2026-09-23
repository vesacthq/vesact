---
name: adding-a-dependency
description: "Use when installing a runtime or development package into a specific pnpm workspace while preserving the shared catalog and lockfile."
---

# Adding a dependency

## Scope

Use only when existing platform, workspace, or standard-library code cannot satisfy the requirement. Do not add packages for trivial helpers or place app-only dependencies at the monorepo root.

## Procedure

1. Identify the importing workspace from its `package.json`, for example `apps/studio/package.json` (`studio`) or `packages/api/package.json` (`@repo/api`).
2. Search `pnpm-workspace.yaml` and all workspace manifests for an existing catalog entry or dependency before installing.
3. Add the entry to the importing workspace's `package.json` by hand, `"catalog:"` when the catalog has the package and otherwise a caret range of the current release (`pnpm view <package> version`), then run `pnpm install`; `minimumReleaseAge: 1440` makes it take the newest release in that range older than 24 hours. Avoid `pnpm add`: it re-resolves peer variants across the whole workspace and changes dozens of lockfile lines in packages nobody touched (checked 2026-09-23 with pnpm 11.3), which step 6 then has to reject.
4. If several workspaces intentionally share the version, add the version under `catalog` in `pnpm-workspace.yaml`, then use `"catalog:"` in each consumer. Keep internal packages on `"workspace:*"`. A manifest cannot use `catalog:` before that key exists.
5. Import only from the workspace that declares the package. Do not rely on pnpm hoisting.
6. Review `package.json` and `pnpm-lock.yaml`; reject unexpected lifecycle scripts or unrelated lockfile churn.
7. From a clean checkout of the resulting change, prove CI installation and gates:
   ```bash
   pnpm install --frozen-lockfile
   pnpm format
   pnpm lint
   pnpm type-check
   ```
   Run affected tests/build as required by the imported surface.

Canonical reference: `pnpm-workspace.yaml` centralizes React, TanStack, oRPC, Vitest, and other shared versions; `apps/studio/package.json` consumes them with `catalog:`.

## Done

- The dependency is declared in the smallest correct workspace and the lockfile is synchronized.
- Existing catalog/workspace conventions are preserved.
- Clean frozen install, formatting, lint, type-check, and affected tests pass.

## Common mistakes

- Editing only `package.json` without updating `pnpm-lock.yaml`.
- Adding a shared dependency with divergent versions instead of using the catalog.
- Installing at the root because the import resolves locally.
- Bypassing the 24-hour release-age policy or enabling a new build script without review.
- Treating an Oxfmt lockfile/manifest diff as lint output; run `pnpm format`, then `pnpm verify`.
- Resetting `pnpm-lock.yaml` by hand after an install and installing again: pnpm compares the manifests, not the lockfile, answers "Already up to date" and leaves the lockfile stale for CI's frozen install. Delete `node_modules/.pnpm-workspace-state-v1.json` first.
