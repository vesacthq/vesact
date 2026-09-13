import type { VerifiedKey } from "@repo/relay/auth";

export type { VerifiedKey };

export interface RelayAuth {
	organizationId: string;
	apiKeyId: string;
	permissions: Record<string, string[]>;
	key: VerifiedKey;
}

export interface RelayContext {
	requestId: string;
	/** Set by app.ts once the key is verified; absent on the public routes. */
	auth?: RelayAuth;
	/** Filled in by `relayKeyProcedure` so the usage record carries the route pattern. */
	trace: { path?: string };
}
