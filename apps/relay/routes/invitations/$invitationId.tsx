import { sessionQueryOptions } from "@auth/lib/api";
import { getInvitation } from "@auth/lib/auth-server.server";
import { OrganizationInvitation } from "@organizations/components/OrganizationInvitation";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadInvitationFn = createServerFn({ method: "GET" })
	.validator((invitationId: string) => invitationId)
	.handler(({ data: invitationId }) => getInvitation(invitationId));

// Outside the authenticated layout: that layout requires an organization,
// and an invitee may be joining their first one.
export const Route = createFileRoute("/invitations/$invitationId")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());

		if (!session) {
			throw redirect({ to: "/login", search: { redirectTo: location.href } });
		}

		return { session };
	},
	loader: ({ params }) => loadInvitationFn({ data: params.invitationId }),
	component: InvitationPage,
	head: () => ({ meta: [{ title: documentTitle("Invitation") }] }),
});

function InvitationPage() {
	const { invitationId } = Route.useParams();
	const { session } = Route.useRouteContext();
	const lookup = Route.useLoaderData();

	return (
		<AuthWrapper>
			<OrganizationInvitation
				invitationId={invitationId}
				lookup={lookup}
				userEmail={session.user.email}
			/>
		</AuthWrapper>
	);
}
