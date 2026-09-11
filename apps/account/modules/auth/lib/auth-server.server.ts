import { auth } from "@repo/auth";
import { getInvitationById } from "@repo/database";
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

export async function getOrganizationList() {
	return toJsonSafe(await auth.api.listOrganizations({ headers: getRequestHeaders() }));
}

export async function getOrganizationBySlug(organizationSlug: string) {
	try {
		return toJsonSafe(
			await auth.api.getFullOrganization({
				query: { organizationSlug },
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

export async function getInvitation(id: string) {
	try {
		return await getInvitationById(id);
	} catch {
		return null;
	}
}

/**
 * Better Auth answers a missing organization and a non-member the same way:
 * there is no organization for this user. Anything else (database, network,
 * expired session) is a failure the caller must see, or the query cache
 * would keep an empty answer.
 */
export function isOrganizationUnavailable(error: unknown) {
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
