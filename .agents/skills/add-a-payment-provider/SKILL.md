---
name: add-a-payment-provider
description: "Use when implementing and selecting a payment provider adapter with checkout, portal, webhook, cancellation, and seat semantics."
---

# Add a payment provider

## Scope

Use for a new provider implementation or switching the exported provider. Do not use for a plan-only change or live credential/product provisioning.

## Procedure

1. Implement `packages/payments/provider/<provider>/index.ts` against `CreateCheckoutLink`, `CreateCustomerPortalLink`, `SetSubscriptionSeats`, `CancelSubscription`, and `WebhookHandler` from `packages/payments/types.ts`.
2. Add the SDK only to `packages/payments/package.json`. Lazily construct its client and validate server-only environment variables at operation time; add blank API/webhook keys to `.env.local.example`.
3. Preserve metadata keys `user_id` and `organization_id`; webhook events must create/update/delete purchases through `@repo/database` and call `setCustomerIdToEntity()`.
4. Read the raw `Request` body once and verify provider signatures before any side effect. Return deliberate statuses: reject missing/invalid signatures, acknowledge handled/ignored events, and preserve provider retry semantics for processing failures.
5. Select exactly one adapter with `packages/payments/provider/index.ts`. `packages/api/index.ts` already exposes its `webhookHandler` as `POST /api/webhooks/payments`; do not add an app route.
6. Confirm provider identifiers map through `getPlanIdByProviderPriceId()` and that one-time/subscription lifecycle events populate `priceId`, `customerId`, `subscriptionId`, and status.
7. Add unit tests with SDK/database mocks for signature rejection, create/update/delete events, and missing configuration.
8. Run focused adapter/API tests plus `pnpm --filter @repo/payments type-check`, `pnpm --filter @repo/api test`, root type-check, and build.

Canonical references: `packages/payments/types.ts`, `packages/payments/provider/index.ts` (currently Stripe), `packages/payments/provider/stripe/index.ts`, `packages/payments/lib/provider-price-ids.ts`, and `packages/api/index.ts`. Polar, Lemon Squeezy, Creem, and Dodo Payments are shipped alternate adapters.

## Done

- All required adapter operations and lifecycle events are implemented or explicitly rejected.
- Provider export, env template, webhook verification, purchase persistence, and tests agree.
- Checkout and customer portal flows build with the selected adapter.

## Common mistakes

- Adding the adapter directory but leaving `packages/payments/provider/index.ts` exporting Stripe.
- Exporting multiple adapters' same-named functions from `packages/payments/provider/index.ts`.
- Parsing/re-serializing the body before signature verification.
- Trusting webhook metadata without mapping the provider price ID to configured plans.
- Claiming seat-based billing support when `setSubscriptionSeats` throws or is a no-op.
