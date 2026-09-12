import { useParams, useRouteContext } from "@tanstack/react-router";

/** The organization named in the URL, from the list the layout loaded. */
export function useActiveOrganization() {
	const organizations = useRouteContext({
		from: "/_authenticated",
		select: (context) => context.organizations,
	});
	const { organizationSlug } = useParams({ strict: false });

	return organizations.find((organization) => organization.slug === organizationSlug) ?? null;
}
