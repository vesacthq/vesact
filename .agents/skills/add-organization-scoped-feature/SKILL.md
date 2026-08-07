---
name: add-organization-scoped-feature
description: "Use when adding tenant-owned data or behavior that must enforce Better Auth organization membership and role boundaries."
---

# Add an organization-scoped feature

## Scope

Use when records, routes, or actions belong to an organization. Do not infer tenant authorization from an active slug, client context, or authentication alone.

## Procedure

1. Add `organizationId` and an indexed foreign key to tenant-owned tables in active `packages/database/drizzle/schema/postgres.ts`; choose nullability, uniqueness, and cascade behavior deliberately.
2. Require organization scope in database query signatures and include it in every read/update/delete predicate.
3. Accept a stable `organizationId` in the oRPC Zod input, use `protectedProcedure`, then call `verifyOrganizationMembership()` or the owner/admin-only `verifyOrganizationBillingManagement()` before reading/mutating protected data.
4. Enforce roles server-side. Use owner/admin checks for management writes; never trust `isOrganizationAdmin` from React.
5. Place organization UI routes under `apps/saas/routes/_authenticated/_main/$organizationSlug/`. The slug selects UI context; resolve it through authenticated loader/context or `useActiveOrganizationQuery({ slug }, { enabled: true })` and handle loading/missing/error states.
6. Use `useActiveOrganization()` only for display, navigation, and optimistic affordances. Include ID/slug in every TanStack Query key (`activeOrganizationQueryKey()` is the model).
7. Add tests proving a member of organization A cannot access organization B, and that denied calls do not perform database/provider effects.
8. Generate/apply the Drizzle migration and run API tests, SaaS type-check, and relevant E2E.

Canonical references: `getOrganizationMembership()` in `packages/database/drizzle/queries/organizations.ts`; both membership helpers in `packages/api/modules/organizations/lib/membership.ts`; `packages/api/modules/organizations/procedures/create-logo-upload-url.ts`; `packages/api/modules/payments/procedures/create-checkout-link.ts`; and `activeOrganizationQueryKey()` in `apps/saas/modules/organizations/lib/api.ts`.

## Done

- Schema, queries, procedure input, authorization, query keys, and route params carry organization scope end-to-end.
- Cross-tenant denial and allowed-role behavior are tested.

## Common mistakes

- Checking membership after fetching or mutating sensitive tenant data.
- Authorizing by slug without resolving membership.
- Omitting the tenant ID/slug from cache keys.
- Treating `protectedProcedure` or `ActiveOrganizationProvider` as tenant authorization.
- Reusing an unscoped query/update helper for tenant-owned rows.
