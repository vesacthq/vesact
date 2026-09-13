import { auth } from "@repo/relay/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError } from "better-auth/api";

export async function getSession() {
	const session = await auth.api.getSession({
		headers: getRequestHeaders(),
		query: {
			disableCookieCache: true,
		},
	});

	return toJsonSafe(session);
}

/** Null when the organization does not exist or the user is not a member. */
export async function getOrganizationBySlug(slug: string) {
	try {
		return toJsonSafe(
			await auth.api.getFullOrganization({
				query: { organizationSlug: slug },
				headers: getRequestHeaders(),
			}),
		);
	} catch (error) {
		if (isOrganizationUnavailable(error)) {
			return null;
		}
		throw error;
	}
}

export async function getOrganizationList() {
	return toJsonSafe(await auth.api.listOrganizations({ headers: getRequestHeaders() }));
}

export type InvitationLookup =
	| {
			status: "pending";
			invitation: {
				id: string;
				email: string;
				role: string;
				organizationId: string;
				organizationName: string;
				organizationSlug: string;
				inviterEmail: string;
				expiresAt: string;
			};
	  }
	| { status: "invalid" }
	| { status: "notRecipient" };

/**
 * Better Auth answers a missing, used or expired invitation with one error
 * and an invitation for another email with another; the page shows which.
 */
export async function getInvitation(id: string): Promise<InvitationLookup> {
	try {
		const invitation = await auth.api.getInvitation({
			query: { id },
			headers: getRequestHeaders(),
		});

		return {
			status: "pending",
			invitation: {
				id: invitation.id,
				email: invitation.email,
				role: invitation.role,
				organizationId: invitation.organizationId,
				organizationName: invitation.organizationName,
				organizationSlug: invitation.organizationSlug,
				inviterEmail: invitation.inviterEmail,
				expiresAt: new Date(invitation.expiresAt).toISOString(),
			},
		};
	} catch (error) {
		if (error instanceof APIError) {
			return {
				status:
					error.body?.code === "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION"
						? "notRecipient"
						: "invalid",
			};
		}
		throw error;
	}
}

/**
 * Better Auth answers a missing organization and a non-member the same way:
 * there is no organization for this user. Anything else is a failure the
 * caller must see, or a query cache would keep an empty answer.
 */
function isOrganizationUnavailable(error: unknown) {
	return (
		error instanceof APIError &&
		typeof error.body?.code === "string" &&
		[
			"ORGANIZATION_NOT_FOUND",
			"USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION",
			"NO_ACTIVE_ORGANIZATION",
		].includes(error.body.code)
	);
}

function toJsonSafe<T>(value: T): T {
	return value == null ? value : (JSON.parse(JSON.stringify(value)) as T);
}
