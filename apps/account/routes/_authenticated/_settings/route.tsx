import { getOrganizationList } from "@auth/lib/auth-server.server";
import { useOrganizationListQuery } from "@organizations/lib/api";
import { SettingsShell } from "@shared/components/SettingsShell";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

interface SettingsSearch {
	/** Absolute URL of the product page that linked here; the header's back button returns to it. */
	from?: string;
}

const loadOrganizationsForSettingsFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => ({ result: await getOrganizationList() }),
);

export const Route = createFileRoute("/_authenticated/_settings")({
	validateSearch: (search): SettingsSearch => ({
		from: typeof search.from === "string" ? search.from : undefined,
	}),
	loader: async () => ({
		organizations: (await loadOrganizationsForSettingsFn()).result,
	}),
	component: SettingsLayout,
});

function SettingsLayout() {
	const { organizations } = Route.useLoaderData();
	useOrganizationListQuery(organizations);

	return (
		<SettingsShell>
			<Outlet />
		</SettingsShell>
	);
}
