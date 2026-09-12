import type { AuthConfig } from "./types";

export const config = {
	enableSignup: true,
	enableMagicLink: true,
	enableSocialLogin: true,
	enablePasskeys: true,
	enablePasswordLogin: true,
	enableTwoFactor: true,
	/**
	 * Require users to verify their email before they can sign in. Kept
	 * separate from `enableSignup` so an invitation-only product can still
	 * require verified emails for non-invited paths.
	 */
	requireEmailVerification: true,
	sessionCookieMaxAge: 60 * 60 * 24 * 30,
	users: {
		enableOnboarding: true,
	},
	organizations: {
		enable: true,
		hideOrganization: false,
		enableUsersToCreateOrganizations: true,
		requireOrganization: false,
		forbiddenOrganizationSlugs: [
			"new-organization",
			"admin",
			"settings",
			"ai-demo",
			"organization-invitation",
			"chatbot",
			"onboarding",
			"checkout-return",
			"choose-plan",
			"api",
			"v1",
			"webhooks",
			"oauth",
		],
	},
} as const satisfies AuthConfig;
