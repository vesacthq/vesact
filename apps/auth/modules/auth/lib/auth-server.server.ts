import { auth } from "@repo/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";

export async function getSession() {
	const session = await auth.api.getSession({
		headers: getRequestHeaders(),
		query: {
			disableCookieCache: true,
		},
	});

	return session == null ? session : (JSON.parse(JSON.stringify(session)) as typeof session);
}
