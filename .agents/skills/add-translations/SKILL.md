---
name: add-translations
description: "Use when adding or changing use-intl message keys across the Studio, account, Relay, marketing, mail and shared scopes, locales, and locale-aware routing."
---

# Add translations

## Scope

Use for user-visible strings or locale behavior. Do not translate logs, stable API codes, database enum values, or provider identifiers.

## Procedure

1. Choose the owning scope: `studio.json`, `account.json`, `relay.json`, `marketing.json`, `mail.json`, or cross-surface `shared.json` under `packages/i18n/translations/<locale>/`.
2. Add the same nested key and compatible placeholders to `en` and `zh`, the only locales for now. English is the fallback, not permission to omit `zh`.
3. In Studio, import `useTranslations`/`useFormatter` through `@i18n/intl` (`apps/studio/modules/i18n/intl.tsx`). Marketing components currently import from `use-intl`.
4. For route metadata or non-React code, use `createTranslatorForLocale(locale, scope)` from `@repo/i18n`, as in `apps/marketing/routes/contact/index.tsx`.
5. Keep locale registration, currency, default locale, and cookie name in `packages/i18n/config.ts`. Adding a locale also requires every scope's JSON file under its folder and imports/entries in `packages/i18n/messages.ts`.
6. Preserve localized navigation through each app's `modules/i18n/routing.tsx` (`LocaleLink`, `useLocaleRouter`, `localeRedirect`); do not concatenate prefixes by hand.
7. Exercise every interpolation/plural branch and inspect at least the default locale plus one non-default locale.
8. Check all scopes for missing keys across non-default locales:
   ```bash
   node --input-type=module <<'NODE'
   import { readFile } from "node:fs/promises";

   const locales = ["en", "zh"];
   const scopes = ["shared", "studio", "account", "relay", "marketing", "mail"];
   const flattenKeys = (value, prefix = "") =>
     Object.entries(value).flatMap(([key, child]) => {
       const path = prefix ? `${prefix}.${key}` : key;
       return child && typeof child === "object" ? flattenKeys(child, path) : [path];
     });
   const missingKeys = [];

   for (const scope of scopes) {
     const english = JSON.parse(
       await readFile(`packages/i18n/translations/en/${scope}.json`, "utf8"),
     );
     const expectedKeys = flattenKeys(english);
     for (const locale of locales.slice(1)) {
       const translated = JSON.parse(
         await readFile(`packages/i18n/translations/${locale}/${scope}.json`, "utf8"),
       );
       const translatedKeys = new Set(flattenKeys(translated));
       for (const key of expectedKeys) {
         if (!translatedKeys.has(key)) missingKeys.push(`${locale}/${scope}: ${key}`);
       }
     }
   }

   if (missingKeys.length) {
     console.error(missingKeys.join("\n"));
     process.exitCode = 1;
   }
   NODE
   ```
9. Run:
   ```bash
   pnpm format
   pnpm lint
   pnpm type-check
   pnpm build
   ```

Canonical references: `packages/i18n/config.ts`, `packages/i18n/messages.ts`, `apps/marketing/routes/contact/index.tsx`, `apps/studio/modules/i18n/intl.tsx`, and `packages/mail/emails/EmailVerification.tsx`.

## Done

- Every locale has the key with matching placeholders and the correct scope consumes it.
- Metadata, UI, and locale-aware links render without missing-message errors.

## Common mistakes

- Adding a key to `en` only because fallback hides omissions.
- Importing a Studio message into the marketing or mail scope.
- Hardcoding locale prefixes or formatting currency/date manually when formatter helpers exist.
- Translating stable plan IDs, notification enum values, or auth error codes.
- Adding a locale to config without all scope imports in `messages.ts`.
