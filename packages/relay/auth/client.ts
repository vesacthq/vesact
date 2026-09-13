import { apiKeyClient } from "@better-auth/api-key/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ac, roles } from "./access";

const consoleUrl = import.meta.env.VITE_RELAY_URL as string | undefined;

export const authClient = createAuthClient({
	baseURL: consoleUrl ? `${consoleUrl}/api/auth` : undefined,
	plugins: [organizationClient({ ac, roles }), apiKeyClient()],
});
