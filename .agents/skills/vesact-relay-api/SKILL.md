---
name: vesact-relay-api
description: "Use when adding or changing Relay /v1 endpoints, API keys, rate limits, idempotency, the Meta webhook, or the relay console routes under apps/relay."
---

# Relay API

The design is `docs/relay/architecture.md`; this file is the implementation map.

Relay's public API lives in `packages/api/modules/relay` with its own router,
context and handler (prefix `/v1`), mounted by `apps/relay/src/api.ts`. Keys
belong to an organization and come from `@better-auth/api-key` on Relay's own
Better Auth instance (`packages/relay/auth`: Google sign-in, the organization
plugin and the api-key plugin on Relay's database, cookie prefix `relay`;
prefix `relay_`, 300 requests per minute per key by default); they are
created, listed and revoked through the relay Worker's own
`/api/auth/api-key/*` endpoints, guarded by the `apiKey` statement in
`packages/relay/auth/access.ts` (owner and admin manage keys, member reads). `app.ts` verifies the key before oRPC runs and
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

The console on the `relay.` hostname signs in with Google at `/login`
(`apps/relay/routes/login`, callback `<VITE_RELAY_URL>/api/auth/callback/google`,
handler at `routes/api/auth/$.ts`) and creates the first organization at
`/orgs/new`; `apps/relay/routes/_authenticated` loads the session and the
organization list once per page into the route context (`@auth/lib/api`,
`@organizations/lib/api`), `/` opens the active organization,
`/$organizationSlug` is open to every member (a non-member sees 404),
`/$organizationSlug/settings/api-keys` lists, creates and revokes keys from the
browser through the same-origin `/api/auth/api-key/*` endpoints
(`@api-keys/lib/api`); the secret exists only in the create response.
`/$organizationSlug/settings/members` (`@organizations/lib/members`) manages
members and invitations through the organization plugin: owners and admins
invite, change roles and remove, everyone can leave, and an invitation is a
link (`/invitations/$id`) the inviter copies — Relay sends no email. For a
console session without Google (local checks, future e2e):
`BETTER_AUTH_SECRET=… pnpm --filter @repo/scripts relay:session --email <email>`
writes a user and session into Relay's database and prints the cookie.
