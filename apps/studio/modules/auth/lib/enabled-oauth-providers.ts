import { createServerFn } from "@tanstack/react-start";

import { type OAuthProvider, oAuthProviders } from "../constants/oauth-providers";

// The credentials are server-only, so the buttons a visitor sees are decided
// here rather than from a second, hand-maintained list of enabled providers.
export const getEnabledOAuthProviders = createServerFn({ method: "GET", strict: false }).handler(
	() => {
		const providers = Object.keys(oAuthProviders).filter((provider) => {
			const prefix = provider.toUpperCase();
			return Boolean(process.env[`${prefix}_CLIENT_ID`] && process.env[`${prefix}_CLIENT_SECRET`]);
		}) as OAuthProvider[];

		return { result: providers };
	},
);
