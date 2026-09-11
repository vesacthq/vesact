import { organizationListQueryOptions } from "@organizations/lib/api";
import { SettingsShell } from "@shared/components/SettingsShell";
import { createFileRoute, Outlet } from "@tanstack/react-router";

interface SettingsSearch {
	/** Absolute URL of the product page that linked here; the header's back button returns to it. */
	from?: string;
}

export const Route = createFileRoute("/_authenticated/_settings")({
	validateSearch: (search): SettingsSearch => ({
		from: typeof search.from === "string" ? search.from : undefined,
	}),
	loader: async ({ context: { queryClient } }) => ({
		organizations: await queryClient.ensureQueryData(organizationListQueryOptions()),
	}),
	component: SettingsLayout,
});

function SettingsLayout() {
	return (
		<SettingsShell>
			<Outlet />
		</SettingsShell>
	);
}
