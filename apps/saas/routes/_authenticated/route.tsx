import { SessionProvider } from "@auth/components/SessionProvider";
import { getActiveOrganizationById, getSession } from "@auth/lib/auth-server.server";
import { ActiveOrganizationProvider } from "@organizations/components/ActiveOrganizationProvider";
import { ConfirmationAlertProvider } from "@shared/components/ConfirmationAlertProvider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadSessionForAuthenticatedRouteFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => {
		return { result: await getSession() };
	},
);

const loadActiveOrganizationForAuthenticatedRouteFn = createServerFn({
	method: "GET",
	strict: false,
})
	.inputValidator((organizationId: string) => organizationId)
	.handler(async ({ data: organizationId }) => ({
		result: await getActiveOrganizationById(organizationId),
	}));

type AuthenticatedRouteSession = Awaited<ReturnType<typeof getSession>>;
type AuthenticatedRouteActiveOrganization = Awaited<ReturnType<typeof getActiveOrganizationById>>;

export const Route = createFileRoute("/_authenticated")({
	loader: async () => {
		const session = unwrapServerFnResult<AuthenticatedRouteSession>(
			await loadSessionForAuthenticatedRouteFn(),
		);
		if (!session) {
			throw redirect({ href: "/login" });
		}
		const activeOrganization = session.session.activeOrganizationId
			? unwrapServerFnResult<AuthenticatedRouteActiveOrganization>(
					await loadActiveOrganizationForAuthenticatedRouteFn({
						data: session.session.activeOrganizationId,
					}),
				)
			: null;

		return { activeOrganization, session };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { activeOrganization, session } = Route.useLoaderData();

	return (
		<SessionProvider initialSession={session}>
			<ActiveOrganizationProvider initialActiveOrganization={activeOrganization}>
				<ConfirmationAlertProvider>
					<Outlet />
				</ConfirmationAlertProvider>
			</ActiveOrganizationProvider>
		</SessionProvider>
	);
}

function unwrapServerFnResult<T>(value: T | { result: T }): T {
	return value && typeof value === "object" && "result" in value && Object.keys(value).length === 1
		? value.result
		: (value as T);
}
