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
import { getBaseUrl, getTrustedOrigins } from "@repo/utils";
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
import { updateSeatsInOrganizationSubscription } from "./lib/organization";
import { invitationOnlyPlugin } from "./plugins/invitation-only";

const getLocaleFromRequest = (request?: Request) => {
	const cookies = parseCookies(request?.headers.get("cookie") ?? "");
	return normalizeLocale(cookies[i18nConfig.localeCookieName]);
};

const appUrl = getBaseUrl(process.env.VITE_SAAS_URL, 3000);

export const auth = betterAuth({
	baseURL: appUrl,
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
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "github"],
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
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			scope: ["user:email"],
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
			sendInvitationEmail: async ({ email, id, organization }, request) => {
				const locale = getLocaleFromRequest(request);
				const existingUser = await getUserByEmail(email);

				const url = new URL(
					existingUser ? "/login" : "/signup",
					getBaseUrl(process.env.VITE_SAAS_URL, 3000),
				);

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

export type OrganizationMemberRole = ActiveOrganization["members"][number]["role"];

export type OrganizationInvitationStatus = typeof auth.$Infer.Invitation.status;

export type OrganizationMetadata = Record<string, unknown> | undefined;
