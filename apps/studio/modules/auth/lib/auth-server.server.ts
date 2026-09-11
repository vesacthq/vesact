import { auth } from "@repo/auth";
import { getInvitationById } from "@repo/database";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError } from "better-auth/api";

export async function getSession() {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({
		headers,
		query: {
			disableCookieCache: true,
		},
	});

	return toJsonSafe(session);
}

export async function getActiveOrganization(slug: string) {
	return getFullOrganization({ organizationSlug: slug });
}

export async function getActiveOrganizationById(organizationId: string) {
	return getFullOrganization({ organizationId });
}

async function getFullOrganization(
	query: { organizationSlug: string } | { organizationId: string },
) {
	try {
		return toJsonSafe(await auth.api.getFullOrganization({ query, headers: getRequestHeaders() }));
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

export async function getUserAccounts() {
	try {
		const userAccounts = await auth.api.listUserAccounts({
			headers: getRequestHeaders(),
		});

		return toJsonSafe(userAccounts);
	} catch {
		return [];
	}
}

export async function getUserPasskeys() {
	try {
		const userPasskeys = await auth.api.listPasskeys({
			headers: getRequestHeaders(),
		});

		return toJsonSafe(userPasskeys);
	} catch {
		return [];
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
