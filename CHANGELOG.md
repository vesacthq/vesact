# Changelog

## 2026-08-02

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.47`, `@ai-sdk/anthropic` to `^4.0.27`, `@ai-sdk/openai` to `^4.0.27`, `@ai-sdk/react` to `^4.0.50`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1101.0`, `dodopayments` to `^2.44.0`, `hono` to `^4.12.33`, `nuqs` to `^2.9.4`, and `openai` to `^7.3.0`. Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@shikijs/rehype` to `^4.4.1` and `turbo` to `^2.10.8`.

---

## 2026-07-31

### Fixed

- **Auth redirects**: Hardened `getSafeRedirectPath` to normalize root-relative SaaS paths only, preventing untrusted `redirectTo` values from navigating users to external sites.
- **SaaS indexing**: Added app-wide `noindex, nofollow` robots metadata so authentication and protected SaaS pages are not included in search results.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.42`, `@ai-sdk/anthropic` to `^4.0.24`, `@ai-sdk/openai` to `^4.0.24`, `@ai-sdk/react` to `^4.0.45`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1098.0`, `@tanstack/react-start` to `^1.168.33`, `nuqs` to `^2.9.3`, `postcss` to `8.5.25`, and `stripe` to `^22.4.0`. Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-30

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.41`, `@ai-sdk/openai` to `^4.0.23`, `@ai-sdk/react` to `^4.0.44`, `@orpc/client`, `@orpc/json-schema`, `@orpc/openapi`, `@orpc/server`, `@orpc/tanstack-query`, and `@orpc/zod` to `1.14.13`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1097.0`, `openai` to `^7.1.0`, and `postcss` to `8.5.24`. Synced the lockfile to the catalog (including prior bumps for `@ai-sdk/anthropic` `^4.0.23`, `fumadocs-core` / `fumadocs-ui` `16.13.0`, and `@types/node` `26.1.2`). Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `resend` to `^6.18.1` in `@repo/mail`.

---

## 2026-07-29

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.40`, `@ai-sdk/anthropic` to `^4.0.23`, `@ai-sdk/openai` to `^4.0.22`, `@ai-sdk/react` to `^4.0.43`, `@orpc/client`, `@orpc/json-schema`, `@orpc/openapi`, `@orpc/server`, `@orpc/tanstack-query`, and `@orpc/zod` to `1.14.12`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1096.0`, `fumadocs-core` / `fumadocs-ui` to `16.13.0`, and upgraded `openai` to `^7.0.0` (major; no direct SDK usage in the repo). Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@types/node` to `26.1.2`, `oxlint` to `1.76.0`, and `oxfmt` to `0.61.0`.

---

## 2026-07-28

### Added

#### Marketing site & SaaS app

- **Consent banner**: Mounted the existing `ConsentProvider` and `ConsentBanner` in both root layouts. The consent choice is now read back from the `consent` cookie on load, so the banner stays hidden after a user allows or declines.

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@orpc/client`, `@orpc/json-schema`, `@orpc/openapi`, `@orpc/server`, `@orpc/tanstack-query`, and `@orpc/zod` to `1.14.10`. Upgraded `prisma-zod-generator` to `3.0.1` (major) and regenerated Prisma Zod schemas. Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `turbo` to `^2.10.7`.

---

## 2026-07-27

### Fixed

#### API

- **Organization billing authorization**: Require organization membership when listing purchases and an owner or administrator role when creating organization checkout sessions. Inaccessible customer portal purchases now return `NOT_FOUND` to prevent resource enumeration.
- **Payment redirects**: Restrict checkout and customer portal return URLs to the configured SaaS application origin.
- **AI message validation**: Validate incoming UI messages with the AI SDK before converting them or invoking the model.

### Changed

#### API

- **Response contracts**: Added explicit, co-located Zod output schemas to source-equivalent oRPC procedures while preserving existing TanStack response shapes.

#### SaaS app

- **Organization role select**: Removed secondary role descriptions from the organization role select and the unused translation keys so the selector shows only compact role names.

#### Dependencies

- **Production dependencies**: Bumped `@ai-sdk/anthropic` to `^4.0.21`, `lucide-react` to `^1.27.0`, and `recharts` to `^3.10.1`. Synced the lockfile to the catalog (including prior bumps for `ai` `^7.0.37`, `@aws-sdk/client-s3` / `@aws-sdk/s3-request-presigner` `3.1095.0`, `better-auth` `1.6.25`, `hono` `^4.12.32`, `dodopayments` `^2.43.0`, `es-toolkit` to `^1.50.0`, `nuqs` `^2.9.2`, `openai` `^6.49.0`, `fumadocs-core` / `fumadocs-ui` `16.12.1`, and `react-email` / `@react-email/ui` `^6.9.1`). Skipped `@types/uuid` (deprecated), `@orpc/*` `1.14.10`, and `turbo` `2.10.7` (published within the one-day `minimumReleaseAge` window). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-26

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1095.0`, `hono` to `^4.12.32`, `@ai-sdk/anthropic` to `^4.0.20`, `dodopayments` to `^2.43.0`, `es-toolkit` to `^1.50.0`, and `nuqs` to `^2.9.2`. Synced the lockfile to the catalog (including prior bumps for `ai` `^7.0.37`, `@ai-sdk/openai` `^4.0.20`, `@ai-sdk/react` `^4.0.40`, `better-auth` `1.6.25`, `lucide-react` `^1.26.0`, `use-intl` `^4.13.4`, `openai` `^6.49.0`, `fumadocs-core` / `fumadocs-ui` `16.12.1`, and `react-email` / `@react-email/ui` `^6.9.1`). Skipped `@types/uuid` (deprecated), `@ai-sdk/anthropic` `4.0.21`, and `turbo` `2.10.7` (published within the one-day `minimumReleaseAge` window). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `postcss` to `8.5.23` and `@playwright/test` to `^1.62.0`.

---

## 2026-07-25

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.37`, `@ai-sdk/anthropic` to `^4.0.19`, `@ai-sdk/openai` to `^4.0.20`, `@ai-sdk/react` to `^4.0.40`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1094.0`, `better-auth` to `1.6.25`, `@better-auth/passkey` to `1.6.25`, `lucide-react` to `^1.26.0`, `use-intl` to `^4.13.4`, `openai` to `^6.49.0`, `fumadocs-core` / `fumadocs-ui` to `16.12.1`, and `react-email` / `@react-email/ui` to `^6.9.1`. Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Synced `postcss` to `8.5.22`, `@vitejs/plugin-react` to `^6.0.4`, and `turbo` to `^2.10.6` in the lockfile.

---

## 2026-07-24

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.35`, `@ai-sdk/openai` to `^4.0.18`, `@ai-sdk/react` to `^4.0.38`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1093.0`, `better-auth` to `1.6.24`, `@better-auth/passkey` to `1.6.24`, `postcss` to `8.5.22`, `fumadocs-core` / `fumadocs-ui` to `16.12.0`, and `@vitejs/plugin-react` to `^6.0.4`. Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `turbo` to `^2.10.6`.

---

## 2026-07-23

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.34`, `@ai-sdk/anthropic` to `^4.0.18`, `@ai-sdk/openai` to `^4.0.17`, `@ai-sdk/react` to `^4.0.37`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1092.0`, `@tanstack/react-query` to `^5.101.4`, `postcss` to `8.5.21`, `react` and `react-dom` to `19.2.8`, `use-intl` to `^4.13.3`, and `resend` to `^6.18.0`. Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.75.0`, `oxfmt` to `0.60.0`, and `oxlint-tsgolint` to `^7.0.2001` (major upgrade).

---

## 2026-07-22

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.32`, `@ai-sdk/react` to `^4.0.35`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1091.0`, `recharts` to `^3.10.0`, `@tanstack/react-query` to `^5.101.3`, and `@polar-sh/sdk` to `^0.49.0`. Skipped `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-21

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@tanstack/react-start` to `^1.168.32`, `nuqs` to `^2.9.1`, `postcss` to `8.5.20`, and `react-dropzone` to `^19.1.1`. Skipped `@types/uuid` (deprecated).
- **Development dependencies**: Upgraded `typescript` to `7.0.2` (major upgrade). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-20

### Changed

#### Dependencies

- **Production dependencies**: Bumped `hono` to `^4.12.31` and `react-dropzone` to `^19.0.2` (major upgrade: accepts in-limit files instead of rejecting the whole batch). Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.

---

## 2026-07-19

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.31`, `@ai-sdk/anthropic` to `^4.0.16`, `@ai-sdk/openai` to `^4.0.16`, `@ai-sdk/react` to `^4.0.34`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1090.0`, `@tanstack/react-start` to `^1.168.30`, and `lucide-react` to `^1.25.0`. Synced the lockfile for catalog upgrades from the previous run (including `fumadocs` 16.11.5/15.2.0, `openai` 6.48.0, `react-email` 6.9.0, `stripe` 22.3.2, `@scalar/hono-api-reference` 0.11.11, `autoprefixer` 10.5.4, `vite` 8.1.5, and `tailwindcss` 4.3.3). Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Synced `oxlint-tsgolint` to `^0.25.0`.

---

## 2026-07-18

### Changed

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.30`, `@ai-sdk/openai` to `^4.0.15`, `@ai-sdk/react` to `^4.0.33`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1089.0`, `fumadocs-core` and `fumadocs-ui` to `16.11.5`, `fumadocs-mdx` to `15.2.0`, `openai` to `^6.48.0`, `react-email` and `@react-email/ui` to `^6.9.0`, `stripe` to `^22.3.2`, and `@scalar/hono-api-reference` to `^0.11.11`. Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `@tailwindcss/vite` to `^4.3.3`, `autoprefixer` to `10.5.4`, `tailwindcss` to `4.3.3`, `vite` to `^8.1.5`, and `oxlint-tsgolint` to `^0.25.0`.

---

## 2026-07-16

### Fixed

- **Avatar crop dialog**: Contained the Cropper.js canvas and shade inside the dialog so resizing the crop area no longer overflows the modal. The initial crop selection is 95% of the available area so drag handles stay visible by default.

### Changed

#### Theme and UI

- **Font**: Replaced Figtree with Plus Jakarta Sans in the SaaS and marketing app layouts.
- **Color tokens**: Switched the shared theme from stone to zinc neutrals, with slate primary accents in light and dark mode (`tooling/tailwind/theme.css`).
- **Buttons**: Hover states use `color-mix` for primary/secondary/destructive via CSS variables, and outline buttons use foreground-based borders and hover fills.
- **Dialogs and menus**: Alert dialogs use `bg-card` with larger radius; dialogs use `rounded-2xl`; dropdown menus use `rounded-xl`.
- **Logo**: Slightly smaller default logo mark (`size-8`).

#### SaaS app

- **App shell**: Removed the floating content card. Navbar and main content share the same background and are separated by a border; content padding aligns with the navbar.
- **Navbar collapse**: Replaced the header toggle with a Vercel-style edge drag strip (hover chip) to expand/collapse the sidebar. Active nav items use a muted background instead of a bordered card. Expanded mode shows the logo label.
- **Organization select**: Card-styled trigger with tighter padding; dropdown uses a regular width with the trigger as min-width, and opens to the right when the sidebar is collapsed. Plan label line-height is tightened so the trigger height stays stable. Personal account uses a user icon (instead of the profile photo), drops the group title, and shows the “Personal account” label as the row text.
- **Organization grid**: Organization logos use rounded corners to match the refreshed card styling.
- **User menu**: Dropdown uses a regular width with the trigger as min-width; opens above (expanded), to the right (collapsed desktop), or below and right-aligned (mobile).
- **Auth screens**: Removed the bordered auth card wrapper; titles and subtitles are centered. Login/signup divider labels use `bg-background`.
- **Settings**: Simplified active sessions and connected accounts rows (no bordered cards); settings item headers get consistent bottom padding on wide layouts.

#### Marketing

- **Hero**: Dropped the primary-tinted gradient background; hero media frame uses `bg-muted`.
- **Consent banner**: Allow action uses the primary button variant explicitly.

#### Database

- **Two-factor authentication**: Added `failedVerificationCount` and `lockedUntil` to the PostgreSQL, MySQL, and SQLite Drizzle schemas. Apply with your usual database push/migrate workflow.

#### Apps

- **Favicon**: Wired the shared rocket `icon.png` favicon for SaaS, marketing, and docs via `public/icon.png` and root head links (previously unused route assets / missing docs icon).

#### Dependencies

- **Production dependencies**: Bumped `ai` to `^7.0.28`, `@ai-sdk/anthropic` to `^4.0.15`, `@ai-sdk/openai` to `^4.0.14`, `@ai-sdk/react` to `^4.0.30`, `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` to `3.1087.0`, `openai` to `^6.47.0`, and `autoprefixer` to `10.5.3`. Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `oxlint` to `1.74.0`, `oxfmt` to `0.59.0`, and `turbo` to `^2.10.5`.

---

## 2026-07-15

### Changed

#### Mail

- **Default provider**: Switched the default mail provider export from Plunk to Resend. The Plunk provider implementation and `PLUNK_API_KEY` example environment variable were removed.

#### Dependencies

- **Production dependencies**: Bumped `@tanstack/react-form` to `^1.33.2`, `@tanstack/react-router` to `^1.170.18`, `@tanstack/react-start` to `^1.168.28`, `fumadocs-core` and `fumadocs-ui` to `16.11.4`, `fumadocs-mdx` to `15.1.1`, `react-email` to `^6.8.1`, and `@react-email/ui` to `^6.8.1`. Skipped `ai` `7.0.26`, `@ai-sdk/*` `4.0.13`/`4.0.14`/`4.0.27`, and `@aws-sdk/*` `3.1086.0` because they were published within the last 24 hours, plus `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `postcss` to `8.5.19`. Skipped `turbo` `2.10.5` because it was published within the last 24 hours.

---

## 2026-07-14

### Changed

#### Dependencies

- **Production dependencies**: Bumped `@orpc/*` to `1.14.8`, `hono` to `^4.12.30`, `nanoid` to `^6.0.0`, and `react-dropzone` to `^17.0.0`. Synced the lockfile for catalog upgrades from previous runs. Skipped `typescript` `7.x` (major upgrade pending ecosystem support) and `@types/uuid` (deprecated). Refresh the lockfile with `pnpm install` after pulling. `pnpm-workspace.yaml` enforces `minimumReleaseAge: 1440` (one day) at install time.
- **Development dependencies**: Bumped `postcss` to `8.5.18` and `tsx` to `^4.23.1`.

---

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
