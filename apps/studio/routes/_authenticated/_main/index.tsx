import { getOrganizationList, getSession } from "@auth/lib/auth-server.server";
import { useTranslations } from "@i18n/intl";
import { OrganizationsGrid } from "@organizations/components/OrganizationsGrid";
import { config as authConfig } from "@repo/auth/config";
import { Card } from "@repo/ui";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const loadSessionForMainIndexRouteFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => {
		return { result: await getSession() };
	},
);

const loadOrganizationListForMainIndexRouteFn = createServerFn({
	method: "GET",
	strict: false,
}).handler(async () => ({ result: await getOrganizationList() }));

type MainIndexSession = Awaited<ReturnType<typeof getSession>>;
type MainIndexOrganizations = Awaited<ReturnType<typeof getOrganizationList>>;

export const Route = createFileRoute("/_authenticated/_main/")({
	loader: async () => {
		const session = unwrapServerFnResult<MainIndexSession>(await loadSessionForMainIndexRouteFn());

		if (!session) {
			throw redirect({ href: "/login" });
		}

		const organizations = unwrapServerFnResult<MainIndexOrganizations>(
			await loadOrganizationListForMainIndexRouteFn(),
		);

		if (authConfig.organizations.enable && authConfig.organizations.requireOrganization) {
			const organization =
				organizations.find((org) => org.id === session.session.activeOrganizationId) ||
				organizations[0];

			if (!organization) {
				throw redirect({ href: "/new-organization" });
			}

			throw redirect({ href: `/${organization.slug}` });
		}

		return { session };
	},
	component: DashboardHome,
	head: () => ({ meta: [{ title: documentTitle("Start") }] }),
});

function DashboardHome() {
	const { session } = Route.useLoaderData();
	const t = useTranslations();

	return (
		<div className="">
			<PageHeader
				title={t("start.welcome", { name: session?.user.name })}
				subtitle={t("start.subtitle")}
			/>

			<div>
				{authConfig.organizations.enable && <OrganizationsGrid />}

				<Card className="mt-6">
					<div className="h-64 p-8 flex items-center justify-center text-foreground/60">
						Place your content here...
					</div>
				</Card>
			</div>
		</div>
	);
}

function unwrapServerFnResult<T>(value: T | { result: T }): T {
	return value && typeof value === "object" && "result" in value && Object.keys(value).length === 1
		? value.result
		: (value as T);
}
