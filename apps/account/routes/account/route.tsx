import { AccountHeader } from "@account/components/AccountHeader";
import { SessionProvider } from "@auth/components/SessionProvider";
import { getSession } from "@auth/lib/auth-server.server";
import { ConfirmationAlertProvider } from "@shared/components/ConfirmationAlertProvider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadSessionForAccountRouteFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => ({ result: await getSession() }),
);

export const Route = createFileRoute("/account")({
	loader: async ({ location }) => {
		const session = (await loadSessionForAccountRouteFn()).result;

		if (!session) {
			throw redirect({ to: "/login", search: { redirectTo: location.href } });
		}

		return { session };
	},
	component: AccountLayout,
});

function AccountLayout() {
	const { session } = Route.useLoaderData();

	return (
		<SessionProvider initialSession={session}>
			<ConfirmationAlertProvider>
				<div className="py-6 flex min-h-screen w-full flex-col">
					<AccountHeader />
					<main className="mt-8 max-w-4xl container">
						<Outlet />
					</main>
				</div>
			</ConfirmationAlertProvider>
		</SessionProvider>
	);
}
