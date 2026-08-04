---
name: reviewing-a-pr
description: "Use when performing a risk-focused code review of a pull request against repository conventions and validation evidence."
---

# Reviewing a PR

## Scope

Use to identify correctness, security, regression, and test gaps. Do not implement unrelated cleanup or approve based only on green CI.

## Procedure

1. Read PR intent and checks:
   ```bash
   gh pr view <pr-number>
   gh pr checks <pr-number>
   ```
2. Inspect the merge-base diff:
   ```bash
   git diff --stat origin/main...HEAD
   git diff origin/main...HEAD
   ```
3. Trace each changed public symbol to callers, tests, exports, configuration, translations, and data ownership. Prioritize auth, organization scoping, payments, webhooks, uploads, and server/client boundaries.
4. Verify framework fit against current source:
   - Routes use `createFileRoute`; route data loading uses `loader`/`beforeLoad` with `createServerFn`.
   - HTTP endpoints may use `route.server.handlers`, such as the API catch-all or sitemap.
   - Redirect/not-found control flow is thrown from TanStack Router where required.
   - Forms use `@tanstack/react-form`; async client state uses TanStack Query and oRPC query options.
   - There are no React Server Components, Server Actions, `"use client"`, or `next/*` APIs.
5. Verify generated boundaries: reject hand edits to `apps/*/routeTree.gen.ts`, `apps/marketing/.content-collections/`, or generated Drizzle migration artifacts. Review their source inputs instead.
6. Compare claimed evidence with `.github/workflows/validate-prs.yml`: frozen install, `pnpm verify`, type-check, build, unit, then both app `e2e:ci` suites. Run a focused reproducer for suspected defects.
7. If structural changes alter paths, scripts, commands, exports, architecture, env variables, ports, or canonical examples, require updates to `AGENTS.md` and every affected `.agents/skills/*/SKILL.md`. Skills are operational documentation and stale references are a review defect.
8. Write findings by severity with a concrete failure scenario, affected path/symbol, and minimal correction. Separate blocking defects from optional suggestions.

Canonical references: `apps/saas/routes/_authenticated/route.tsx` for auth routing, `packages/api/modules/payments/procedures/create-checkout-link.ts` for authorization, and `.github/workflows/validate-prs.yml` for gates.

## Done

- Every finding is supported by code or runtime evidence and explains impact.
- Authorization, tenant isolation, migrations, external side effects, and regression coverage are explicitly considered.
- Repository guidance and relevant skills match any structural change.
- If no findings remain, state what was inspected and any residual test risk.

## Common mistakes

- Reviewing style while missing a cross-tenant data path.
- Assuming generated files prove their source files are correct.
- Requesting Next.js patterns such as RSC, Server Actions, or `next/navigation`.
- Treating `components.json`'s `rsc` field as runtime architecture; this repository does not use RSC.
- Approving moved/renamed architecture while `AGENTS.md` or a canonical skill still points to the old structure.
