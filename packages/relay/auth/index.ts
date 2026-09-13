import { apiKey } from "@better-auth/api-key";
import { logger } from "@repo/logs";
import { getBaseUrl } from "@repo/utils";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

import { db } from "../db";
import { ac, roles } from "./access";

// The console's address; the auth endpoints and the OAuth callback live under
// it, and the session cookie is host-only there.
const consoleUrl = getBaseUrl(process.env.VITE_RELAY_URL, 3005);

export const auth = betterAuth({
	baseURL: consoleUrl,
	trustedOrigins: [new URL(consoleUrl).origin],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	advanced: {
		database: {
			generateId: false,
		},
		// Studio's cookies are set on the parent domain and reach this hostname
		// too; a different prefix keeps the two logins apart.
		cookiePrefix: "relay",
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30,
		freshAge: 0,
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			scope: ["email", "profile"],
		},
	},
	plugins: [
		// Invitations are links the inviter shares; Relay sends no email.
		organization({ ac, roles }),
		apiKey({
			references: "organization",
			defaultPrefix: "relay_",
			// The console tells keys apart by their first characters; the plugin's
			// default of 6 is exactly the `relay_` prefix, so nothing beyond it
			// would be stored.
			startingCharactersConfig: { shouldStore: true, charactersLength: 12 },
			rateLimit: { enabled: true, timeWindow: 60_000, maxRequests: 300 },
		}),
	],
	onAPIError: {
		onError(error, ctx) {
			logger.error(error, { ctx });
		},
	},
});

export type Session = typeof auth.$Infer.Session;

export type Organization = typeof auth.$Infer.Organization;

export type ActiveOrganization = NonNullable<
	Awaited<ReturnType<typeof auth.api.getFullOrganization>>
>;

export type VerifiedKey = NonNullable<Awaited<ReturnType<typeof auth.api.verifyApiKey>>["key"]>;
