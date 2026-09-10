import { SessionProvider } from "@auth/components/SessionProvider";
import { getSession } from "@auth/lib/auth-server.server";
import { ConfirmationAlertProvider } from "@shared/components/ConfirmationAlertProvider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadSessionForAuthenticatedRouteFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => ({ result: await getSession() }),
);

export const Route = createFileRoute("/_authenticated")({
	loader: async ({ location }) => {
		const session = (await loadSessionForAuthenticatedRouteFn()).result;

		if (!session) {
			throw redirect({ to: "/login", search: { redirectTo: location.href } });
		}

		return { session };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { session } = Route.useLoaderData();

	return (
		<SessionProvider initialSession={session}>
			<ConfirmationAlertProvider>
				<Outlet />
			</ConfirmationAlertProvider>
		</SessionProvider>
	);
}
