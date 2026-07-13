# Changelog

## 2026-07-13

### Changed

#### Dependencies

- **Production dependencies**: Bumped `fumadocs-core` and `fumadocs-ui` to `16.11.3`. Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `postcss` to `8.5.17`.

---

## 2026-07-12

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.22`, `@ai-sdk/anthropic` to `^4.0.12`, `@ai-sdk/react` to `^4.0.23`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1085.0`, `hono` to `^4.12.29`, `use-intl` to `^4.13.2`, `fumadocs-core` / `fumadocs-ui` to `16.11.2`, and `react-email` / `@react-email/ui` to `^6.7.0`. Synced the lockfile for catalog upgrades from the previous run. Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.1.1`.

---

## 2026-07-11

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.19`, `@ai-sdk/anthropic` to `^4.0.11`, `@ai-sdk/openai` to `^4.0.11`, `@ai-sdk/react` to `^4.0.20`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1084.0`, `@tanstack/react-form` to `^1.33.1`, `dodopayments` to `^2.42.2`, `lucide-react` to `^1.24.0`, `openai` to `^6.46.0`, `react-email` and `@react-email/ui` to `^6.6.9`, `stripe` to `^22.3.1`, and `vite` to `^8.1.4`. Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-10

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1083.0`, `@scalar/hono-api-reference` to `^0.11.9`, and `resend` to `^6.17.2`. Synced the lockfile for `dodopayments` `^2.42.1`, `react-email` / `@react-email/ui` `^6.6.8`, and `fumadocs-core` / `fumadocs-ui` `16.11.1` and `fumadocs-mdx` `15.1.0`.
- **Development dependencies**: Bumped `@types/node` to `26.1.1`. Skipped `@ai-sdk/anthropic` `4.0.10`, `ai` `7.0.18`, `@ai-sdk/react` `4.0.19`, and `@aws-sdk/*` `3.1084.0` because they were published within the last 24 hours, and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-09

### Changed

#### Dependencies

- **Production dependencies**: Bumped `dodopayments` to `^2.42.1`, `react-email` and `@react-email/ui` to `^6.6.8`, and `fumadocs-core` / `fumadocs-ui` to `16.11.1` and `fumadocs-mdx` to `15.1.0`.
- **Development dependencies**: Skipped `@ai-sdk/anthropic` `4.0.9`, `ai` `7.0.17`, `@ai-sdk/react` `4.0.18`, and `@aws-sdk/*` `3.1081.0` because they were published within the last 24 hours, and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-08

### Changed

- **Dependabot**: Removed the `.github/dependabot.yml` configuration. Dependency updates are now manual or can be automated with AI agent tools such as Cursor Automations or Claude Code Routines. `pnpm-workspace.yaml` still enforces `minimumReleaseAge: 1440` (one day) at install time.

### Fixed

- Removed the stale `cropperjs/dist/cropper.css` import from the SaaS app root route. Cropper.js v2 ships its styles inside its web components, and the CSS file no longer exists in the package, which broke the Vite/Rolldown build.

### Removed

- **API rate limiting**: Removed the in-memory API rate limiting middleware from auth, RPC, and payment webhook routes so the API no longer returns 429 responses under load.

### Changed

- Replaced the separate "Delete avatar" and "Delete logo" text buttons with a trash icon button overlaid on the bottom-right corner of the avatar or organization logo image in account and organization settings.
- Updated button hover backgrounds to use `color-mix` (current background blended with 5% foreground) instead of opacity-based fades. Added shared `--button-hover-*` theme variables in `tooling/tailwind/theme.css` and applied them across all `Button` variants.

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.16`, `@ai-sdk/react` to `^4.0.17`, `@orpc/*` to `1.14.7`, `hono` to `^4.12.28`, `dodopayments` to `^2.42.0`, and `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1080.0`.
- **Development dependencies**: Bumped `vitest` and `@vitest/coverage-v8` to `^4.1.10`, `turbo` to `^2.10.4`, `oxlint` to `1.73.0`, and `oxfmt` to `0.58.0`. Reformatted the workspace with the new `oxfmt` version and excluded `tooling/tailwind/tailwind-animate.css` from formatting (its slash-containing custom property names are not parseable by `oxfmt`). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-07

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@ai-sdk/openai` to `^4.0.8`. Other available updates (`ai` 7.0.16, `@ai-sdk/react` 4.0.17, `dodopayments` 2.42.0, `hono` 4.12.28, `@aws-sdk/client-s3` 3.1080.0, `oxlint` 1.73.0, `oxfmt` 0.58.0, and `turbo` 2.10.4) were skipped because they were published within the last 24 hours. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-06

### Fixed

- **Dodo Payments webhooks**: Coerced webhook metadata values to strings before validation so payment events with non-string metadata are handled reliably.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.15`, `@ai-sdk/anthropic` to `^4.0.8`, `@ai-sdk/react` to `^4.0.16`, and `dodopayments` to `^2.41.0`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-05

### Changed

#### Dependencies

- **Production dependencies**: Bumped `recharts` to `^3.9.2` and `resend` to `^6.17.1`.
- **Development dependencies**: Bumped `@shikijs/rehype` to `^4.3.1`, `tsx` to `^4.23.0`, and `turbo` to `^2.10.3`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-04

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.14`, `@ai-sdk/anthropic` to `^4.0.7`, `@ai-sdk/openai` to `^4.0.7`, `@ai-sdk/react` to `^4.0.15`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1079.0`, `@scalar/hono-api-reference` to `^0.11.8`, `react-email` to `^6.6.6`, and `@react-email/ui` to `^6.6.6`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `vite` to `^8.1.3` and `tsx` to `^4.22.5`.

---

## 2026-07-03

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.11`, `@ai-sdk/anthropic` to `^4.0.5`, `@ai-sdk/openai` to `^4.0.5`, `@ai-sdk/react` to `^4.0.12`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1078.0`, `@tanstack/react-router` to `^1.170.17`, `@tanstack/react-start` to `^1.168.27`, `@scalar/hono-api-reference` to `^0.11.7`, `lucide-react` to `^1.23.0`, `nuqs` to `^2.9.0`, `recharts` to `^3.9.1`, `nodemailer` to `^9.0.3`, `sharp` to `^0.35.3`, `use-intl` to `^4.13.1`, and `vite` to `^8.1.2`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.1.0`, `turbo` to `^2.10.2`, and `oxlint-tsgolint` to `^0.24.0`.

---

## 2026-07-01

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.7`, `@ai-sdk/anthropic` to `^4.0.2`, `@ai-sdk/openai` to `^4.0.3`, `@ai-sdk/react` to `^4.0.8`, Better Auth to `1.6.23`, `@better-auth/passkey` to `1.6.23`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1076.0`, `fumadocs-core` and `fumadocs-ui` to `16.10.7`, and `tailwindcss` to `4.3.2`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.72.0`, `oxfmt` to `0.57.0`, and `turbo` to `^2.10.1`.

---

## 2026-06-30

### Changed

#### Dependencies

- **Production dependencies**: Major upgrades — `ai` to `^7.0.4`, `@ai-sdk/anthropic` to `^4.0.1`, `@ai-sdk/openai` to `^4.0.2`, `@ai-sdk/react` to `^4.0.5`, `cookie` to `^2.0.0`, `cropperjs` to `2.1.1`, and `nodemailer` to `^9.0.1`. Removed `react-cropper` in favor of native Cropper.js v2 integration in the avatar crop dialog. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-30 (earlier)

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@ai-sdk/anthropic` to `^3.0.89`, `@ai-sdk/openai` to `^3.0.77`, `@ai-sdk/react` to `^3.0.216`, and `ai` to `^6.0.214`. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `cropperjs` 2.x were intentionally skipped pending migration work.
- **Development dependencies**: Bumped `@types/node` to `26.0.1` and `prettier` to `3.9.3`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-29

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@tanstack/react-query` to `5.101.2`, `dodopayments` to `2.40.1`, `fumadocs-core` to `16.10.6`, `fumadocs-mdx` to `15.0.13`, and `fumadocs-ui` to `16.10.6`. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `cropperjs` 2.x were intentionally skipped pending migration work. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-28

### Changed

#### Dependencies

- **Production dependencies**: Bumped Better Auth to `1.6.22`, `@better-auth/passkey` to `1.6.22`, `resend` to `6.16.0`, and `@scalar/hono-api-reference` to `0.11.6`. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `cropperjs` 2.x were intentionally skipped pending migration work. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-27

### Changed

#### Dependencies

- **Production dependencies**: Bumped AI SDK packages (`ai` `6.0.211`, `@ai-sdk/anthropic` `3.0.87`, `@ai-sdk/openai` `3.0.75`, `@ai-sdk/react` `3.0.213`), `es-toolkit` `1.49.0`, `nodemailer` `8.0.11`, and `dotenv` `17.4.2`, along with other workspace runtime dependencies resolved in the lockfile. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, `cookie` 2.x, `nodemailer` 9.x, and `cropperjs` 2.x were intentionally skipped pending migration work.
- **Development dependencies**: Bumped `@types/node` to `22.20.0` and `@types/js-cookie` to `3.0.6`. Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-06-26

### Changed

#### Dependencies

- **Production dependencies**: Bumped 50+ production packages, including TanStack Router `1.170.16`, TanStack Start `1.168.26`, Better Auth `1.6.20`, oRPC `1.14.6`, Stripe `22.3.0`, Tailwind CSS `4.3.1`, AWS SDK S3 clients `3.1075.0`, Lucide React `1.21.0`, Fumadocs `16.10.5`, and other workspace runtime dependencies. Major-version upgrades for `ai` 7.x, `@ai-sdk/*` 4.x, and `cookie` 2.x were intentionally skipped pending migration work.
- **Development dependencies**: Bumped Turborepo to `2.10.0`, Oxlint to `1.71.0`, Oxfmt to `0.56.0`, TypeScript to `6.0.3`, Vitest to `4.1.9`, and Playwright to `1.61.1`. Added `minimumReleaseAge: 1440` (one day) to `pnpm-workspace.yaml` to match the other repositories. Refresh the lockfile with `pnpm install` after pulling.

---

## 2026-06-16

### Fixes and improvements

#### SaaS app

- **Organization members**: Removed the role permissions summary box from the members settings page. Role descriptions now appear only inside the role select dropdown (capped to one line), and the select trigger shows only the role label for a compact layout.

---

## 2026-06-12

### Fixes and improvements

#### Infrastructure

- **TanStack Start dev server**: SaaS and marketing server entries now use `createServerEntry` and forward the first request pass into the SSR Vite environment via an `x-ssr-dispatch` header. In dev, Nitro runs the entry in its own environment where TanStack Start's server-function resolver is not wired, so `/_serverFn/` calls previously returned 500 with `Cannot read properties of undefined (reading 'method')`. Server functions now resolve in the SSR environment in both dev and production.

#### Continuous integration

- **End-to-end tests**: Marketing Playwright config uses `import.meta.url` instead of `__dirname` so CI can load the ES module package. The SaaS dev server falls back to a dummy `DATABASE_URL` when unset so e2e can boot without a live database.

---

## 2026-06-02

### Fixed

#### Organizations

- **Hide delete organization for non-owners (SUP-33)**: The "Delete Organization" section in organization general settings is now only visible to members with the `owner` role. Non-owner admins can still access all other organization settings.

#### SaaS app

- **Avatar and organization logo settings**: Added delete actions for user avatars and organization logos in general settings, plus the matching English translations so both image-management flows are internally consistent.

### Security

#### Auth

- **Magic-link open redirect**: Replaced `trustedOrigins: ["*"]` in `packages/auth/auth.ts` with an explicit allow-list of the app's own origins. The wildcard disabled better-auth's origin/callback validation, allowing an attacker-controlled `callbackURL` to drive an open redirect out of the magic-link verify flow while a valid session cookie was set on the legitimate domain.
- **Shared trusted origins**: Added a `getTrustedOrigins()` helper in `@repo/utils` (SaaS app origin plus the marketing origin when `VITE_MARKETING_URL` is set) and used it as the single source of truth for both better-auth's `trustedOrigins` and the API CORS allow-list in `packages/api`, so the two can no longer drift apart.
- **Username enumeration**: Removed the `username()` better-auth plugin, which exposed an unauthenticated `POST /api/auth/is-username-available` account-enumeration endpoint. The now-unused `username` and `displayUsername` columns were dropped from the `user` table across the Postgres, MySQL, and SQLite schemas (run `pnpm --filter @repo/database db:generate` and apply the migration).

---

## 2026-05-27

### Changed

#### Infrastructure

- **Node.js and pnpm**: Upgraded from pnpm 10 to `pnpm@11.3.0`, moved `onlyBuiltDependencies` into `pnpm-workspace.yaml` `allowBuilds`, and now require Node.js `>=22`. Turborepo was upgraded to the latest 2.9.x release.
- **Prisma installs**: Disabled postinstall builds for `prisma` and `@prisma/engines` in `allowBuilds` so installs stay fast while Prisma clients are still generated through the database package scripts.
- **Dependabot**: Switched the npm ecosystem schedule from weekly to daily and removed the open-pull-requests limit.
- **Root scripts**: Removed duplicate root-level `db:*` and `user:create` shortcuts; run database and script tasks via `pnpm --filter @repo/database` or `pnpm --filter @repo/scripts` instead.

#### SaaS app

- **Dependencies**: Removed the unused `oslo` package from the SaaS app.

---

## 2026-05-25

### Fixes and improvements

#### Payments

- **Stripe one-time checkout**: Creating a checkout link for a user or organization that already has a Stripe customer no longer sends `customer_creation` alongside `customer`, which Stripe rejects with a parameter conflict error.

---

## 2026-05-21

### Fixes and improvements

#### SaaS app

- **Organization members**: Role selects are ordered member → admin → owner (least to most access). The members settings page includes a role permissions summary, and each role option shows a short description of what it can do.

#### Internationalization

- **Organization role UI**: Member-role hooks and the roles info panel now use the shared `@i18n/intl` formatting helpers instead of `next-intl` imports so the TanStack SaaS app passes oxlint and matches the rest of the workspace.

---

## 2026-05-20

### Removed

#### Mail

- **NewUser template**: Removed the unused `NewUser` email template, its `mailTemplates` registration, and related `mail.json` copy (including `common.otp`) because signup and email changes use `emailVerification` instead.

---

## 2026-05-18

### Changed

#### Mail

- **React Email 6**: The mail package uses the unified `react-email` package (v6). Scoped `@react-email/components` and `@react-email/render` dependencies were removed in favor of imports from `react-email`. The mail preview app replaces `@react-email/preview-server` with `@react-email/ui` per the v6 upgrade guide. Email templates were reformatted with oxfmt.

### Fixed

#### Internationalization

- **TanStack Start paths**: Locale helpers now treat `/_serverFn` like other framework internals so server function traffic is not mistaken for a missing locale prefix during routing and prefetch.

---

## 2026-05-11

### Added

#### SaaS app

- **Admin area**: Added the admin route shell and matching navbar navigation for the admin users section.

### Changed

#### Notifications

- **Preferences**: Account notification settings align with the Next.js starter, including grouped per-type preferences, matching oRPC procedures, Drizzle-backed preference storage, and updated SaaS translations.

#### Continuous integration

- **Verify pipeline**: Marketing content collections generate before oxlint so type-aware lint resolves the virtual module, with formatting and lint cleanups on touched files.

### Fixed

#### Routing and authentication

- **TanStack Start routing**: Updated file-based routing, invitation flows, and Nitro server entries so marketing and SaaS SSR route through the shared service reliably (including Vercel builds).

- **Authentication**: Stabilized SaaS auth redirects, corrected auth form submissions, and surfaced magic link errors on the login form.

#### Settings

- **Account and onboarding**: Moved delete-account controls into general settings, simplified organization general settings, and aligned the onboarding page layout with the shell.

---

## 2026-05-10

### Added

- TanStack Start parity routes for `robots.txt`, generated marketing sitemap output, and private avatar or logo image proxying.
- `@repo/notifications` with notification creation helpers, link resolution, welcome notifications, and notification email support.
- Marketing analytics provider examples for Google Analytics, Mixpanel, PostHog, Vercel Analytics, and custom integrations.

### Fixed

- Restored last-active organization persistence through Better Auth session hooks and Drizzle schema support.
- Added organization membership checks before reading organization purchases or creating organization checkout links.
