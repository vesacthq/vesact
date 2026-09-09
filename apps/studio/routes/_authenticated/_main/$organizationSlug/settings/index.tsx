import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/$organizationSlug/settings/")({
	component: OrganizationSettingsIndex,
});

function OrganizationSettingsIndex() {
	const { organizationSlug } = Route.useParams();
	return (
		<Navigate to="/$organizationSlug/settings/general" params={{ organizationSlug }} replace />
	);
}
