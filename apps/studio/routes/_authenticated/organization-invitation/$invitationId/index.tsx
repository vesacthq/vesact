import { OrganizationInvitationModal } from "@organizations/components/OrganizationInvitationModal";
import { getInvitationById } from "@repo/database";
import { Card, CardContent } from "@repo/ui";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadPendingInvitationForInvitationRouteFn = createServerFn({ method: "GET" })
	.validator((invitationId: string) => invitationId)
	.handler(async ({ data: invitationId }) => {
		const record = await getInvitationById(invitationId);

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

export const Route = createFileRoute("/_authenticated/organization-invitation/$invitationId/")({
	loader: async ({ params }) => {
		return loadPendingInvitationForInvitationRouteFn({ data: params.invitationId });
	},
	component: OrganizationInvitationPage,
	head: () => ({ meta: [{ title: documentTitle("Organization invitation") }] }),
});

function OrganizationInvitationPage() {
	const data = Route.useLoaderData();

	return (
		<div className="max-w-md p-6 mx-auto">
			<Card>
				<CardContent>
					<OrganizationInvitationModal
						invitationId={data.invitationId}
						organizationName={data.organizationName}
						organizationSlug={data.organizationSlug}
						logoUrl={data.logoUrl}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
