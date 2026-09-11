import { APIError } from "better-auth/api";

/**
 * Better Auth answers a missing organization and a non-member the same way:
 * there is no organization for this user. Anything else (database, network,
 * expired session) is a failure the caller must see, or a query cache would
 * keep an empty answer.
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
