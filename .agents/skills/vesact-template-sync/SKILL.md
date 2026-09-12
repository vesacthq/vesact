---
name: vesact-template-sync
description: "Use when reviewing or pulling updates from the supastarter template remote, cherry-picking an upstream commit, taking a dependency bump the template made, or deciding whether a removed template file should come back."
---

# Template sync

This repository started from the supastarter template (`template` remote) and
has diverged: the app directory is renamed, template files are edited freely,
and merges are no longer attempted. Upstream is still read for dependency and
security updates.

- `git fetch template && git log --oneline template-reviewed..template/main`
  lists what has not been looked at. `template-reviewed` is a tag: after going
  through the range, move it with
  `git tag -f template-reviewed template/main && git push -f origin template-reviewed`.
- Take a commit with `git cherry-pick -x <sha>`. One that touches `apps/saas`
  conflicts as "deleted by us"; apply it to `apps/studio` instead:
  `git show <sha> -- apps/saas | sed 's#apps/saas#apps/studio#g' | git apply -3`.
- For dependency bumps, copy the version into the `pnpm-workspace.yaml` catalog
  and run `pnpm install` rather than cherry-picking lockfile changes.
- Removed rather than edited, and not to be restored: everything that moved to
  `apps/account`: the auth pages and forms under
  `apps/studio/routes/{login,signup,forgot-password,reset-password,verify}`,
  `apps/studio/routes/_authenticated/_main/settings`,
  `apps/studio/routes/_authenticated/_main/$organizationSlug/settings`,
  `apps/studio/routes/_authenticated/{onboarding,new-organization,organization-invitation,choose-plan,checkout-return}`,
  `apps/studio/modules/{auth/components,settings,onboarding}`, the organization
  forms, member and invitation lists in `apps/studio/modules/organizations/components`
  and the plan components in `apps/studio/modules/payments/components`; also
  `packages/storage/provider/s3`
  (the AWS SDK cannot construct a client on workerd; `provider/r2` signs with
  aws4fetch) and the unused analytics providers under
  `apps/marketing/modules/analytics/provider`.
- Product code uses names the template will never create (`inbox`, `contacts`,
  `publishing`, `relay`), and product tables live in their own schema file
  re-exported from `packages/database/drizzle/schema/index.ts`, never in
  `postgres.ts`, so upstream changes to those files apply cleanly.
- `.agents/skills/port-app-to-cloudflare` explains the Workers connection
  lifecycle in `packages/database/drizzle/client.ts` and `apps/studio/server.ts`.
  Repository-specific skills live in `.agents/skills/` under names the template
  will not use.
