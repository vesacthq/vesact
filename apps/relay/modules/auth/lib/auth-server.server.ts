import { auth } from "@repo/auth";
import { isOrganizationUnavailable } from "@repo/auth/lib/organization-errors";
import { getRequestHeaders } from "@tanstack/react-start/server";

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

function toJsonSafe<T>(value: T): T {
	return value == null ? value : (JSON.parse(JSON.stringify(value)) as T);
}
