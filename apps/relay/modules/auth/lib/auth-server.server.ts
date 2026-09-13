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
