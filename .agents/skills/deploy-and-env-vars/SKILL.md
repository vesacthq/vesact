---
name: deploy-and-env-vars
description: "Use when linking deployment projects, changing remote environment variables, creating preview/production deployments, or inspecting deployment configuration."
triggers: ["user"]
---

# Deploy and environment variables

## Scope

Use only after an explicit user request because linking, environment writes, and deployments mutate external state. Do not use for local-only `.env.local` setup.

## Procedure

1. Inspect root/app `package.json`, each target `vite.config.ts`, `.env.local.example`, and platform settings. There is no checked-in `vercel.json` or `.vercel/` link; do not assume framework detection, build/output settings, or one project for the three web apps.
2. Run local release gates first:
   ```bash
   pnpm verify
   pnpm type-check
   pnpm test
   pnpm build
   ```
3. Inventory only variables used by the target app/package. Keep `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth, mail, payment, S3, and AI credentials server-only. Only intended browser configuration uses `VITE_`; this repository does not use `NEXT_PUBLIC_`.
4. On Vercel, confirm identity/linkage before mutation:
   ```bash
   vercel whoami
   vercel link --repo
   vercel env ls
   ```
   `vercel link --repo` is appropriate for a monorepo; `.vercel/repo.json` may map multiple projects. Run subsequent commands from the linked directory and confirm team/project, app root, install/build command, and Nitro output before mutation.
5. Add values interactively with explicit environment scope so secrets do not appear in shell history:
   ```bash
   vercel env add <NAME> development
   vercel env add <NAME> preview
   vercel env add <NAME> production
   ```
6. Pull development values only when requested, noting that this overwrites the destination:
   ```bash
   vercel env pull .env.local --environment=development
   ```
7. Create a preview first with `vercel deploy`; inspect it with `vercel inspect <url>`. Verify the correct app, public route, and affected flow; for SaaS also verify `/api/health` plus auth/API behavior.
8. Deploy production only on explicit instruction with `vercel deploy --prod`; report project, URL, target, status, commit, and post-deploy checks. If using `vercel build`, deploy that output with `--prebuilt`.

Canonical references: `.env.local.example`; `apps/saas/vite.config.ts` and `apps/marketing/vite.config.ts` load root env and expose only `VITE_`; all three web app Vite configs use Nitro; root `turbo.json` tracks `.output/**`.

## Done

- Correct project/app, environment scopes, build command, and server/public variable boundaries are confirmed.
- Local gates and preview verification pass before production.
- No secret, `.env.local`, or `.vercel/` linkage data is committed.

## Common mistakes

- Deploying the monorepo as one assumed project without checking app roots.
- Running commands from a directory that is not associated with the intended `.vercel` repo/project link.
- Using `NEXT_PUBLIC_`; this Vite repository exposes `VITE_`.
- Pulling over handcrafted `.env.local` values without warning.
- Adding a secret to Preview but not Production, or sharing a production database with untrusted previews.
