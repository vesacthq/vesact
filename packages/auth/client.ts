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
import { ac, roles } from "./lib/access";

const accountUrl = import.meta.env.VITE_ACCOUNT_URL as string | undefined;

export const authClient = createAuthClient({
	// The account center's URL includes the path it is mounted on, so the auth
	// endpoints sit under it rather than at the origin's /api/auth.
	baseURL: accountUrl ? `${accountUrl}/api/auth` : undefined,
	plugins: [
		inferAdditionalFields<typeof auth>(),
		magicLinkClient(),
		organizationClient({ ac, roles }),
		adminClient(),
		passkeyClient(),
		twoFactorClient(),
		lastLoginMethodClient(),
	],
});

export type AuthClientErrorCodes = typeof authClient.$ERROR_CODES & {
	INVALID_INVITATION: string;
};
