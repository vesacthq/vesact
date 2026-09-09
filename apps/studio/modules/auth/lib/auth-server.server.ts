import { auth } from "@repo/auth";
import { getInvitationById } from "@repo/database";
import { getRequestHeaders } from "@tanstack/react-start/server";

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
	try {
		const activeOrganization = await auth.api.getFullOrganization({
			query: {
				organizationSlug: slug,
			},
			headers: getRequestHeaders(),
		});

		return toJsonSafe(activeOrganization);
	} catch {
		return null;
	}
}

export async function getActiveOrganizationById(organizationId: string) {
	try {
		const activeOrganization = await auth.api.getFullOrganization({
			query: {
				organizationId,
			},
			headers: getRequestHeaders(),
		});

		return toJsonSafe(activeOrganization);
	} catch {
		return null;
	}
}

export async function getOrganizationList() {
	try {
		const organizationList = await auth.api.listOrganizations({
			headers: getRequestHeaders(),
		});

		return toJsonSafe(organizationList);
	} catch {
		return [];
	}
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

function toJsonSafe<T>(value: T): T {
	return value == null ? value : (JSON.parse(JSON.stringify(value)) as T);
}
