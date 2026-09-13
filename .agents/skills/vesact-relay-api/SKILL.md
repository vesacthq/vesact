---
name: vesact-relay-api
description: "Use when adding or changing Relay /v1 endpoints, API keys, rate limits, idempotency, the Meta webhook, or the relay console routes under apps/relay."
---

# Relay API

The design is `docs/relay/architecture.md`; this file is the implementation map.

Relay's public API lives in `packages/api/modules/relay` with its own router,
context and handler (prefix `/v1`), mounted by `apps/relay/src/api.ts`. Keys
belong to an organization and come from `@better-auth/api-key` on the shared
auth instance (prefix `relay_`, 300 requests per minute per key by default);
they are created, listed and revoked through the account center's
`/api/auth/api-key/*` endpoints, guarded by the `apiKey` statement in
`packages/auth/lib/access.ts`. `app.ts` verifies the key before oRPC runs and
puts `{ requestId, auth: { organizationId, apiKeyId, permissions, key } }` in
the context; business endpoints build on `relayKeyProcedure`. Every `/v1` response
carries `X-Request-Id`, authenticated ones the `X-RateLimit-*` headers, and
each authenticated call writes a `relay_api_usage` row after the response.
`/v1/health`, `/v1/openapi.json` and `/v1/docs` need no key: the OpenAPI
document is generated from the router on request (contracts change only in
zod, there is no hand-written spec) and Scalar renders it at `/v1/docs`.
`idempotent` in `lib/idempotency.ts` is mounted per POST route after the key
check (none yet): it keeps the first response for 24 hours per key, path and
`Idempotency-Key`, replays it for the same body, and answers 422 for another
body or 409 while the first request runs.
Errors, even those raised before a procedure, use oRPC's body shape. Relay's
database is its own (`packages/relay/db`: schema, migrations, client, keyed by
`RELAY_DATABASE_URL`; local database `vesact_relay`); until #119 moves the
code, `packages/database/drizzle/schema/relay.ts` still mirrors the tables for
the Studio-side imports. The acceptance run
for the chain is `pnpm --filter @repo/scripts relay:acceptance` (see the
script's header for the arguments).

Meta's webhook is `GET`/`POST /webhooks/meta` in
`packages/api/modules/relay/integrations/meta/webhook.ts`: the handshake checks
`META_WEBHOOK_VERIFY_TOKEN`, the POST verifies `X-Hub-Signature-256` against
`META_APP_SECRET` and stores the parsed body in `relay_inbound_event`, deduplicated
by the raw body's SHA-256; nothing is parsed yet. Its acceptance run is
`pnpm --filter @repo/scripts relay:webhook-acceptance`.

The console on the `relay.` hostname is `apps/relay/routes/_authenticated`:
the session and the organization list load once per page into the route
context (`@auth/lib/api`, `@organizations/lib/api`), `/` opens the active
organization, `/$organizationSlug` checks `relay.access` and renders a denial
that links to the account center's members page, and
`/$organizationSlug/settings/api-keys` lists, creates and revokes keys from the
browser through the account center's `/api/auth/api-key/*` endpoints
(`@api-keys/lib/api`); the secret exists only in the create response. Relay is
one of `getTrustedOrigins()`, which is what lets those cross-origin calls
through the account center's CORS and Better Auth's origin check.
