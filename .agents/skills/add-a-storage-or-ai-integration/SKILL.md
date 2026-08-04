---
name: add-a-storage-or-ai-integration
description: "Use when extending the S3-compatible storage layer or AI SDK model/provider integration through typed server-side packages and oRPC."
---

# Add a storage or AI integration

## Scope

Use for provider/model/bucket integration behind `@repo/storage` or `@repo/ai`. Do not expose provider secrets to browser code or call SDKs directly from React components.

## Procedure

1. Choose the package boundary:
   - Storage bucket config/types and selected provider: `packages/storage/`.
   - AI SDK model exports and shared helpers: `packages/ai/`.
2. Add server-only credentials to `.env.local.example` without `VITE_`. Use `VITE_` only for intentionally public values such as `VITE_AVATARS_BUCKET_NAME`.
3. For storage, update `packages/storage/config.ts` and `packages/storage/types.ts`, implement under `packages/storage/provider/`, and select/export through `packages/storage/provider/index.ts`. Request signed URLs from protected oRPC procedures. The current S3 provider derives MIME from the object extension and signs `content-type`; the browser PUT must send that exact header.
4. For local S3-compatible testing, use `minio` plus `minio-setup` from `docker-compose.yml`; extend its bucket creation when adding a bucket.
5. For AI, export the selected `textModel`/`imageModel`/`audioModel` from `packages/ai/index.ts` and call AI SDK functions only in server procedures. Validate UI messages with `safeValidateUIMessages()`, constrain arrays/tools, and expose streaming with an oRPC `eventIterator` when needed.
6. Keep React clients provider-neutral. `AiChat` adapts `orpcClient.ai.stream` with `eventIteratorToStream()` for `useChat()`; avatar upload uses `orpc.users.avatarUploadUrl.mutationOptions()`.
7. Add tests that mock provider calls and cover malformed input, auth, MIME/path restrictions, and provider failures without real credentials.
8. Translate new UI/errors, then run affected package/API tests, `pnpm type-check`, and `pnpm build`. Exercise MinIO/provider or AI streaming end to end when the required local service/credentials are available; otherwise document the skipped external check.

Canonical references: `packages/storage/provider/s3/index.ts`, `packages/api/modules/organizations/procedures/create-logo-upload-url.ts`, `apps/saas/modules/settings/components/UserAvatarUpload.tsx`, `packages/ai/index.ts`, `packages/api/modules/ai/procedures/stream-message.ts`, and `apps/saas/modules/ai/components/AiChat.tsx`.

## Done

- Secrets remain server-only; package/provider, oRPC, and React boundaries are typed and provider-neutral.
- Local service/env documentation and focused tests cover the integration.

## Common mistakes

- Prefixing `OPENAI_API_KEY` or S3 credentials with `VITE_`.
- Omitting the signed upload `Content-Type`, which invalidates the S3 signature.
- Trusting raw AI UI messages without `safeValidateUIMessages()`.
- Importing env-backed provider clients into browser components.
- Adding provider calls to a component or relying on real external services in unit tests.
