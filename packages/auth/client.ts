import { passkeyClient } from "@better-auth/passkey/client";
import {
	adminClient,
	inferAdditionalFields,
	lastLoginMethodClient,
	magicLinkClient,
	organizationClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from ".";

// This package has no Vite client types of its own; the app that bundles it
// replaces `import.meta.env` at build time.
const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

function authBaseUrl() {
	if (typeof window !== "undefined") {
		return `${window.location.origin}${viteEnv?.BASE_URL ?? "/"}api/auth`;
	}
	const appUrl = typeof process !== "undefined" ? process.env.VITE_SAAS_URL : undefined;
	return appUrl ? `${appUrl.replace(/\/+$/, "")}/api/auth` : undefined;
}

export const authClient = createAuthClient({
	baseURL: authBaseUrl(),
	plugins: [
		inferAdditionalFields<typeof auth>(),
		magicLinkClient(),
		organizationClient(),
		adminClient(),
		passkeyClient(),
		twoFactorClient(),
		lastLoginMethodClient(),
	],
});

export type AuthClientErrorCodes = typeof authClient.$ERROR_CODES & {
	INVALID_INVITATION: string;
};
