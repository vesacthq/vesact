import { getInvitation } from "@auth/lib/auth-server.server";
import { OrganizationInvitationModal } from "@organizations/components/OrganizationInvitationModal";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadPendingInvitationFn = createServerFn({ method: "GET" })
	.validator((invitationId: string) => invitationId)
	.handler(async ({ data: invitationId }) => {
		const record = await getInvitation(invitationId);

		if (!record || record.status !== "pending" || !record.organization) {
			throw notFound();
		}

		return {
			invitationId: record.id,
			organizationName: record.organization.name,
			organizationSlug: record.organization.slug,
			logoUrl: record.organization.logo ?? undefined,
		} as const;
	});

export const Route = createFileRoute("/_authenticated/invitations/$invitationId/")({
	loader: async ({ params }) => loadPendingInvitationFn({ data: params.invitationId }),
	component: InvitationPage,
	head: () => ({ meta: [{ title: documentTitle("Organization invitation") }] }),
});

function InvitationPage() {
	const data = Route.useLoaderData();

	return (
		<AuthWrapper>
			<OrganizationInvitationModal
				invitationId={data.invitationId}
				organizationName={data.organizationName}
				organizationSlug={data.organizationSlug}
				logoUrl={data.logoUrl}
			/>
		</AuthWrapper>
	);
}
