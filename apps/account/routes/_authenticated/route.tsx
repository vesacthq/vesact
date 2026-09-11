import { SessionProvider } from "@auth/components/SessionProvider";
import { sessionQueryOptions } from "@auth/lib/api";
import { ConfirmationAlertProvider } from "@shared/components/ConfirmationAlertProvider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());

		if (!session) {
			throw redirect({ to: "/login", search: { redirectTo: location.href } });
		}

		return { session };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { session } = Route.useRouteContext();

	return (
		<SessionProvider initialSession={session}>
			<ConfirmationAlertProvider>
				<Outlet />
			</ConfirmationAlertProvider>
		</SessionProvider>
	);
}
