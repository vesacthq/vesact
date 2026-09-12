import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
	beforeLoad: ({ context: { session, organizations } }) => {
		const organization =
			organizations.find((item) => item.id === session.session.activeOrganizationId) ??
			organizations[0];

		throw redirect({
			to: "/$organizationSlug",
			params: { organizationSlug: organization.slug },
			replace: true,
		});
	},
});
