import { organizationQueryOptions } from "@organizations/lib/api";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

/**
 * Membership opens Relay: every role of the organization can use the console.
 * Better Auth answers a non-member's lookup like a missing organization.
 */
export const Route = createFileRoute("/_authenticated/$organizationSlug")({
	loader: async ({ params, context: { queryClient } }) => {
		const organization = await queryClient.ensureQueryData(
			organizationQueryOptions(params.organizationSlug),
		);

		if (!organization) {
			throw notFound();
		}

		return {
			organization: { id: organization.id, name: organization.name, slug: organization.slug },
		};
	},
	component: Outlet,
});
