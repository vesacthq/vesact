---
name: add-or-edit-an-email
description: "Use when creating or changing a localized React Email template, subject mapping, preview props, and send call."
---

# Add or edit an email

## Scope

Use for transactional React Email templates and mail dispatch. Do not hardcode provider SDK calls in auth/API features or use this for in-app-only notifications.

## Procedure

1. Create or edit `packages/mail/emails/<Template>.tsx` with React Email primitives and shared `Wrapper`/`PrimaryButton` components.
2. Accept `BaseMailProps`, resolve `getMailTranslator(locale)`, and source user-visible copy from `packages/i18n/translations/{en,de,es,fr}/mail.json`.
3. Set realistic `<Template>.PreviewProps`, including `locale: defaultLocale`, so the React Email preview can render without application state.
4. Register the component key in `mailTemplates` at `packages/mail/emails/index.ts`.
5. Add that key's translated subject path to `mailSubjects` in `packages/mail/lib/templates.ts`. `TemplateId` derives from `mailTemplates`, while `getTemplate()`/`sendEmail()` infer the template context.
6. Call `sendEmail({ to, templateId, context, locale })`; pass the user's/request's locale. It catches provider errors, logs them, and returns `false`, so handle failure explicitly when delivery is part of the operation's contract.
7. Preview with:
   ```bash
   pnpm --filter mail-preview dev
   ```
   Then verify HTML, plain text, subject, links, and all locales with `getTemplate()` or the selected local provider.
8. Run `pnpm --filter @repo/mail type-check`, format, lint, and affected auth/notification tests.

Canonical references: `packages/mail/emails/EmailVerification.tsx`, `packages/mail/emails/index.ts`, `packages/mail/lib/templates.ts`, `packages/mail/lib/send.ts`, and the `sendVerificationEmail` hook in `packages/auth/auth.ts`.

## Done

- Template registry, subject key, all locale files, typed context, preview props, and call site are synchronized.
- Links and fallback locale render correctly in HTML and plain text.

## Common mistakes

- Adding a component without registering it in `mailTemplates` and `mailSubjects`.
- Hardcoding translated copy or a subject in one locale.
- Assuming `sendEmail()` throws on provider failure instead of checking its boolean result where required.
- Passing browser-visible `VITE_` mail credentials; provider secrets are server-only.
- Using raw `<button>` for links that must work in email clients.
