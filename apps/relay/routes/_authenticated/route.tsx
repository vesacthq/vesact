import { loginUrl } from "@auth/lib/account-urls";
import { getSession } from "@auth/lib/auth-server.server";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadSession = createServerFn({ method: "GET", strict: false }).handler(async () => ({
	result: await getSession(),
}));

export const Route = createFileRoute("/_authenticated")({
	loader: async ({ location }) => {
		const { result: session } = await loadSession();

		if (!session) {
			throw redirect({ href: loginUrl(location.href) });
		}

		return { session };
	},
	component: Outlet,
});
