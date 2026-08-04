---
name: adding-a-dependency
description: "Use when installing a runtime or development package into a specific pnpm workspace while preserving the shared catalog and lockfile."
---

# Adding a dependency

## Scope

Use only when existing platform, workspace, or standard-library code cannot satisfy the requirement. Do not add packages for trivial helpers or place app-only dependencies at the monorepo root.

## Procedure

1. Identify the importing workspace from its `package.json`, for example `apps/saas/package.json` (`saas`) or `packages/api/package.json` (`@repo/api`).
2. Search `pnpm-workspace.yaml` and all workspace manifests for an existing catalog entry or dependency before installing.
3. Add the latest eligible package version to the importing workspace. `minimumReleaseAge: 1440` excludes releases newer than 24 hours:
   ```bash
   pnpm --filter saas add <package>
   pnpm --filter @repo/api add -D <package>
   ```
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

Canonical reference: `pnpm-workspace.yaml` centralizes React, TanStack, oRPC, Vitest, and other shared versions; `apps/saas/package.json` consumes them with `catalog:`.

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
