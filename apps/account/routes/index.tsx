import { getSession } from "@auth/lib/auth-server.server";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadSessionFn = createServerFn({ method: "GET", strict: false }).handler(async () => ({
	result: await getSession(),
}));

export const Route = createFileRoute("/")({
	loader: async () => {
		const session = (await loadSessionFn()).result;
		throw redirect({ href: session ? "/account" : "/login" });
	},
});
