---
name: add-a-notification
description: "Use when adding a typed in-app and email notification kind with preferences, persistence, links, and localized settings labels."
---

# Add a notification

## Scope

Use for notification kinds dispatched through `createNotification()`. Do not insert notification rows directly from feature code or confuse the newer per-type preferences with legacy newsletter fields.

## Procedure

1. Add the kind to `NOTIFICATION_TYPES` in `packages/notifications/src/types.ts`; `NotificationType` derives from that constant.
2. Add the exact value to active PostgreSQL `notificationTypeEnum`, update literal unions in `packages/database/drizzle/queries/notifications.ts`, and generate a Drizzle migration.
3. If users may disable the kind, add it to `NotificationTypeId` and a group in `NOTIFICATION_GROUPS`. The union currently includes `WELCOME`, but the rendered groups intentionally expose only `APP_UPDATE`.
4. Add `settings.notificationsPage.types.<TYPE>.label` in every `packages/i18n/translations/{en,de,es,fr}/saas.json`. If the type appears in `NOTIFICATION_GROUPS`, extend the explicit `onToggle` type in `apps/saas/modules/settings/components/NotificationPreferencesForm.tsx` to include the new `NotificationTypeId`.
5. Create a semantic server helper beside `packages/notifications/src/welcome.ts`, localize its user-visible title/message as the feature requires, and export it from `packages/notifications/src/index.ts`.
6. Dispatch with `createNotification({ userId, type, data: { title, message }, link })`. It resolves relative links against `VITE_SAAS_URL`, checks `IN_APP` and `EMAIL` disable rows independently, persists the in-app row when enabled, and sends the generic React Email template when enabled.
7. Trigger the helper from a server-side hook/procedure after the source action succeeds. Log failures deliberately when notifications must not roll back the primary action.
8. Test both channel suppression paths and trigger behavior; run `pnpm --filter @repo/database db:generate`, focused tests, lint, and type-check. Never hand-edit the generated migration.

Canonical references: `packages/notifications/src/create-notification.ts`, `packages/notifications/src/catalog.ts`, `packages/database/drizzle/queries/notifications.ts`, and `createWelcomeNotification()` in `packages/notifications/src/welcome.ts`, called by `packages/auth/auth.ts`.

## Done

- Type constant, PostgreSQL enum, query literals, catalog, all labels, helper export, and trigger are synchronized.
- In-app and email preference suppression is verified.

## Common mistakes

- Updating only the TypeScript constant while the PostgreSQL enum rejects the value.
- Adding a type only to `NotificationTypeId` without putting configurable types in a rendered `NOTIFICATION_GROUPS` entry.
- Adding a configurable type without extending the preferences form's `onToggle` union.
- Storing relative links without `resolveNotificationLink()`.
- Writing directly to `notification` and bypassing channel preferences.
