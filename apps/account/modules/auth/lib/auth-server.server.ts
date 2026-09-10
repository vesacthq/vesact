import { auth } from "@repo/auth";
import { getInvitationById } from "@repo/database";
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

export async function getOrganizationList() {
	try {
		return toJsonSafe(await auth.api.listOrganizations({ headers: getRequestHeaders() }));
	} catch {
		return [];
	}
}

export async function getOrganizationBySlug(organizationSlug: string) {
	try {
		return toJsonSafe(
			await auth.api.getFullOrganization({
				query: { organizationSlug },
				headers: getRequestHeaders(),
			}),
		);
	} catch {
		return null;
	}
}

export async function getInvitation(id: string) {
	try {
		return await getInvitationById(id);
	} catch {
		return null;
	}
}

function toJsonSafe<T>(value: T): T {
	return value == null ? value : (JSON.parse(JSON.stringify(value)) as T);
}
