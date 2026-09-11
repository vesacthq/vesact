import type { auth } from "@repo/auth";

export type VerifiedKey = NonNullable<Awaited<ReturnType<typeof auth.api.verifyApiKey>>["key"]>;

export interface RelayContext {
	requestId: string;
	organizationId: string;
	apiKeyId: string;
	permissions: Record<string, string[]>;
	key: VerifiedKey;
	/** Filled in by `relayKeyProcedure` so the usage record carries the route pattern. */
	trace: { path?: string };
}
