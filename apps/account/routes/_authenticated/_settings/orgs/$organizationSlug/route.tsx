import { getOrganizationBySlug } from "@auth/lib/auth-server.server";
import { useTranslations } from "@i18n/intl";
import { OrganizationLogo } from "@organizations/components/OrganizationLogo";
import { OrganizationProvider } from "@organizations/components/OrganizationProvider";
import { useOrganization } from "@organizations/hooks/use-organization";
import { checkPermission, serializeMemberRoles } from "@repo/permissions";
import { cn } from "@repo/ui";
import { createFileRoute, Link, notFound, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadOrganizationForRouteFn = createServerFn({ method: "GET", strict: false })
	.validator((organizationSlug: string) => organizationSlug)
	.handler(async ({ data: organizationSlug }) => {
		const organization = await getOrganizationBySlug(organizationSlug);

		if (!organization) {
			throw notFound();
		}

		return { result: organization };
	});

export const Route = createFileRoute("/_authenticated/_settings/orgs/$organizationSlug")({
	loader: async ({ params }) => ({
		organization: (await loadOrganizationForRouteFn({ data: params.organizationSlug })).result,
	}),
	component: OrganizationLayout,
});

function OrganizationLayout() {
	const { organization } = Route.useLoaderData();

	return (
		<OrganizationProvider initialOrganization={organization}>
			<OrganizationHeader />
			<Outlet />
		</OrganizationProvider>
	);
}

function OrganizationHeader() {
	const t = useTranslations();
	const { organization, roles } = useOrganization();
	const canManageBilling = checkPermission(
		{ membershipRole: serializeMemberRoles(roles) },
		"organization.manageBilling",
	);

	const tabs = [
		{ to: "/orgs/$organizationSlug", label: t("settings.menu.organization.general"), exact: true },
		{ to: "/orgs/$organizationSlug/members", label: t("settings.menu.organization.members") },
		...(canManageBilling
			? [{ to: "/orgs/$organizationSlug/billing", label: t("settings.menu.organization.billing") }]
			: []),
	] as const;

	return (
		<div className="mb-8">
			<div className="gap-3 flex items-center">
				<OrganizationLogo
					name={organization.name}
					logoUrl={organization.logo}
					className="size-10 rounded-lg"
				/>
				<h1 className="font-medium text-2xl lg:text-3xl">{organization.name}</h1>
			</div>
			<nav className="mt-6 gap-1 flex border-b" aria-label={t("organizations.settings.title")}>
				{tabs.map((tab) => (
					<Link
						key={tab.to}
						to={tab.to}
						params={{ organizationSlug: organization.slug }}
						search={true}
						activeOptions={{ exact: "exact" in tab && tab.exact }}
						className="px-3 py-2 text-sm -mb-px border-b-2 border-transparent text-foreground/70 transition-colors hover:text-foreground"
						activeProps={{
							className: cn("font-medium border-primary text-foreground"),
						}}
					>
						{tab.label}
					</Link>
				))}
			</nav>
		</div>
	);
}
