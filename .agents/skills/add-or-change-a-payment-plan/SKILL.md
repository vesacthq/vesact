---
name: add-or-change-a-payment-plan
description: "Use when changing configured billing plans, provider price IDs, checkout selection, pricing UI, or localized plan copy."
---

# Add or change a payment plan

## Scope

Use for catalog and pricing changes with the current provider. Do not use it to implement a new payment provider or mutate live provider products without explicit deployment approval.

## Procedure

1. Edit `packages/payments/config.ts`; choose a stable plan key and define subscription/one-time prices, major-unit `amount`, ISO `currency`, interval, `seatBased`, and trial behavior. Enterprise plans use `isEnterprise` and no prices.
2. Add each provider price variable to `.env.local.example` and read it unprefixed with `process.env`. `packages/payments/config.ts` is also imported by pricing UI, but TanStack Start strips those server values from client bundles and `priceId` is optional; never display or depend on it in React.
3. Confirm derived `PlanId`, `findPriceByPlanId()`, `getProviderPriceIdByPlanId()`, and reverse webhook mapping in `packages/payments/lib/plans.ts` and `packages/payments/lib/provider-price-ids.ts`.
4. Add plan title, description, and features to all locales in `packages/i18n/translations/{en,de,es,fr}/marketing.json` and `studio.json`.
5. Update the marketing page's explicit `productTitle`/`productDescription`/`productFeatures` switches. Studio `usePlanData()` iterates config keys dynamically but still requires matching `pricing.products.<planId>` messages.
6. Verify user- versus organization-owned billing through `billingAttachedTo`. Organization checkout enforces `verifyOrganizationBillingManagement()` and derives seats from current membership only for `seatBased` prices.
7. Extend checkout tests for the new plan/type/interval and missing price IDs.
8. Run:
   ```bash
   pnpm --filter @repo/api exec vitest run modules/payments/procedures/create-checkout-link.test.ts
   pnpm build
   pnpm lint
   pnpm type-check
   ```

Canonical references: `packages/payments/config.ts`, `packages/payments/lib/provider-price-ids.ts`, `apps/marketing/modules/home/components/PricingSection.tsx`, `apps/studio/modules/payments/hooks/plan-data.tsx`, and `packages/api/modules/payments/procedures/create-checkout-link.ts`.

## Done

- Config, env template, localized copy, pricing UI, provider mapping, and checkout tests agree.
- Both marketing and authenticated pricing render the intended cadence/currency.

## Common mistakes

- Putting a provider secret or price ID behind `VITE_`.
- Treating `amount` as cents; this repository stores major currency units.
- Adding a plan to dynamic Studio data but omitting the marketing switch cases.
- Adding config without translations, causing a plan to fall back to its raw key.
- Changing a live plan key that existing purchase-to-plan resolution depends on.
