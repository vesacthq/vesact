import { apiKey } from "@better-auth/api-key";
import { passkey } from "@better-auth/passkey";
import {
	db,
	getInvitationById,
	getPurchasesByOrganizationId,
	getPurchasesByUserId,
	getUserByEmail,
	getUserById,
} from "@repo/database";
import { config as i18nConfig, normalizeLocale } from "@repo/i18n";
import { logger } from "@repo/logs";
import { sendEmail } from "@repo/mail";
import { createWelcomeNotification } from "@repo/notifications";
import { cancelSubscription } from "@repo/payments";
import { getBaseUrl, getCookieDomain, getTrustedOrigins } from "@repo/utils";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import {
	admin,
	lastLoginMethod,
	magicLink,
	openAPI,
	organization,
	twoFactor,
} from "better-auth/plugins";
import { parseCookie as parseCookies } from "cookie";

import { config } from "./config";
import { ac, roles } from "./lib/access";
import { updateSeatsInOrganizationSubscription } from "./lib/organization";
import { invitationOnlyPlugin } from "./plugins/invitation-only";

const getLocaleFromRequest = (request?: Request) => {
	const cookies = parseCookies(request?.headers.get("cookie") ?? "");
	return normalizeLocale(cookies[i18nConfig.localeCookieName]);
};

// The account center owns the auth endpoints, so every product shares one login
// and one set of OAuth callbacks. Its URL carries the path it is mounted on
// (`/account` under the Studio hostname), which becomes part of the auth path.
const accountUrl = getBaseUrl(process.env.VITE_ACCOUNT_URL, 3004);
const accountOrigin = new URL(accountUrl).origin;
const accountPath = new URL(accountUrl).pathname.replace(/\/$/, "");

// Mounted under the Studio hostname the session cookie is host-only. Until
// production moves there the account center answers on its own hostname, and
// Studio can only read the cookie from the parent domain.
const studioOrigin = new URL(getBaseUrl(process.env.VITE_STUDIO_URL, 3000)).origin;
const cookieDomain = accountOrigin === studioOrigin ? undefined : getCookieDomain(accountUrl);

export const auth = betterAuth({
	baseURL: new URL(accountUrl).origin,
	basePath: `${accountPath}/api/auth`,
	// Explicit allow-list of origins better-auth accepts for origin/CSRF and
	// callback/redirect URL validation. A wildcard ("*") here disables that
	// protection — e.g. it lets an attacker-controlled `callbackURL` drive an
	// open redirect out of the magic-link verify flow — so we constrain it to
	// our own app surfaces (shared with the CORS allow-list in packages/api).
	trustedOrigins: getTrustedOrigins(),
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	advanced: {
		database: {
			generateId: false,
		},
		crossSubDomainCookies: cookieDomain ? { enabled: true, domain: cookieDomain } : undefined,
		// Preview and production share the browser; while production's cookie is
		// still set on the parent domain, a distinct prefix keeps the two apart.
		cookiePrefix: process.env.AUTH_COOKIE_PREFIX,
	},
	session: {
		expiresIn: config.sessionCookieMaxAge,
		freshAge: 0,
	},
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					const user = await getUserById(session.userId);
					return {
						data: {
							...session,
							activeOrganizationId: user?.lastActiveOrganizationId ?? null,
						},
					};
				},
			},
		},
		user: {
			create: {
				after: async (createdUser) => {
					if (!createdUser?.id) {
						return;
					}

					try {
						await createWelcomeNotification(createdUser.id);
					} catch (error) {
						logger.error(error, {
							ctx: "createWelcomeNotification",
							userId: createdUser.id,
						});
					}
				},
			},
		},
	},
	account: {
		identityStrategy: "provider-id",
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path.startsWith("/organization/accept-invitation")) {
				const { invitationId } = ctx.body;

				if (!invitationId) {
					return;
				}

				const invitation = await getInvitationById(invitationId);

				if (!invitation) {
					return;
				}

				await updateSeatsInOrganizationSubscription(invitation.organizationId);
			} else if (ctx.path.startsWith("/organization/remove-member")) {
				const { organizationId } = ctx.body;

				if (!organizationId) {
					return;
				}

				await updateSeatsInOrganizationSubscription(organizationId);
			}
		}),
		before: createAuthMiddleware(async (ctx) => {
			// Reject reserved slugs (/admin, /settings, etc.) server-side so
			// malicious clients cannot skip the generateSlug procedure and
			// collide with built-in app routes.
			if (
				ctx.path.startsWith("/organization/create") ||
				ctx.path.startsWith("/organization/update")
			) {
				const candidateSlug = (
					ctx.path.startsWith("/organization/update") ? ctx.body?.data?.slug : ctx.body?.slug
				) as string | undefined;
				if (
					candidateSlug &&
					(config.organizations.forbiddenOrganizationSlugs as readonly string[]).includes(
						candidateSlug,
					)
				) {
					throw new APIError("BAD_REQUEST", {
						code: "FORBIDDEN_ORGANIZATION_SLUG",
						message: "This organization slug is reserved.",
					});
				}
			}

			if (ctx.path.startsWith("/delete-user") || ctx.path.startsWith("/organization/delete")) {
				const userId = ctx.context.session?.session.userId;
				const { organizationId } = ctx.body;

				if (userId || organizationId) {
					const purchases = organizationId
						? await getPurchasesByOrganizationId(organizationId)
						: await getPurchasesByUserId(userId as string);
					const subscriptions = purchases.filter(
						(purchase) => purchase.type === "SUBSCRIPTION" && purchase.subscriptionId !== null,
					);

					if (subscriptions.length > 0) {
						for (const subscription of subscriptions) {
							await cancelSubscription(subscription.subscriptionId as string);
						}
					}
				}
			}
		}),
	},
	user: {
		additionalFields: {
			onboardingComplete: {
				type: "boolean",
				required: false,
			},
			locale: {
				type: "string",
				required: false,
			},
			lastActiveOrganizationId: {
				type: "string",
				required: false,
			},
		},
		deleteUser: {
			enabled: true,
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailConfirmation: async ({ user: { email, name }, url }, request) => {
				const locale = getLocaleFromRequest(request);
				await sendEmail({
					to: email,
					templateId: "emailVerification",
					context: {
						url,
						name,
					},
					locale,
				});
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		// If email verification is required, don't auto-sign-in until the user
		// confirms their address. For invitation-only setups (which bypass
		// self-serve signup) the invitation itself is proof of ownership, so
		// we auto-sign-in when email verification is turned off.
		autoSignIn: !config.requireEmailVerification,
		requireEmailVerification: config.requireEmailVerification,
		sendResetPassword: async ({ user, url }, request) => {
			const locale = getLocaleFromRequest(request);
			await sendEmail({
				to: user.email,
				templateId: "forgotPassword",
				context: {
					url,
					name: user.name,
				},
				locale,
			});
		},
		minPasswordLength: 8,
	},
	emailVerification: {
		sendOnSignUp: config.requireEmailVerification,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user: { email, name }, url }, request) => {
			const locale = getLocaleFromRequest(request);
			await sendEmail({
				to: email,
				templateId: "emailVerification",
				context: {
					url,
					name,
				},
				locale,
			});
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
		admin(),
		passkey(),
		magicLink({
			disableSignUp: false,
			sendMagicLink: async ({ email, url }, ctx) => {
				const request = ctx?.request as Request;

				const locale = getLocaleFromRequest(request);
				await sendEmail({
					to: email,
					templateId: "magicLink",
					context: {
						url,
					},
					locale,
				});
			},
		}),
		organization({
			ac,
			roles,
			sendInvitationEmail: async ({ email, id, organization }, request) => {
				const locale = getLocaleFromRequest(request);
				const existingUser = await getUserByEmail(email);

				const url = new URL(`${accountUrl}${existingUser ? "/login" : "/signup"}`);

				url.searchParams.set("invitationId", id);
				url.searchParams.set("email", email);

				await sendEmail({
					to: email,
					templateId: "organizationInvitation",
					locale,
					context: {
						organizationName: organization.name,
						url: url.toString(),
					},
				});
			},
		}),
		// Relay's API keys: owned by an organization, verified in-process by the
		// Relay Worker, issued and revoked through this Worker's endpoints.
		apiKey({
			references: "organization",
			defaultPrefix: "relay_",
			// The console tells keys apart by their first characters; the plugin's
			// default of 6 is exactly the `relay_` prefix, so nothing beyond it
			// would be stored.
			startingCharactersConfig: { shouldStore: true, charactersLength: 12 },
			rateLimit: { enabled: true, timeWindow: 60_000, maxRequests: 300 },
		}),
		openAPI(),
		invitationOnlyPlugin(),
		twoFactor(),
		lastLoginMethod(),
	],
	onAPIError: {
		onError(error, ctx) {
			logger.error(error, { ctx });
		},
	},
});

export * from "./lib/organization";

export type Session = typeof auth.$Infer.Session;

export type ActiveOrganization = NonNullable<
	Awaited<ReturnType<typeof auth.api.getFullOrganization>>
>;

export type Organization = typeof auth.$Infer.Organization;

export type OrganizationInvitationStatus = typeof auth.$Infer.Invitation.status;

export type OrganizationMetadata = Record<string, unknown> | undefined;
