import { useTranslations } from "@i18n/intl";
import { OrganizationLogo } from "@organizations/components/OrganizationLogo";
import { useOrganizationListQuery } from "@organizations/lib/api";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRightIcon, PlusIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_settings/orgs/")({
	component: OrganizationsPage,
	head: () => ({ meta: [{ title: documentTitle("Organizations") }] }),
});

function OrganizationsPage() {
	const t = useTranslations();
	const { data: organizations } = useOrganizationListQuery();

	return (
		<div>
			<PageHeader
				title={t("organizations.list.title")}
				subtitle={t("organizations.list.subtitle")}
			/>
			<div className="gap-3 flex flex-col">
				{organizations?.length === 0 && (
					<p className="text-sm text-foreground/60">{t("organizations.list.empty")}</p>
				)}
				{organizations?.map((organization) => (
					<Link
						key={organization.id}
						to="/orgs/$organizationSlug"
						params={{ organizationSlug: organization.slug }}
						search={true}
						className="block"
					>
						<Card className="gap-4 p-4 flex flex-row items-center transition-colors hover:bg-muted/50">
							<OrganizationLogo
								name={organization.name}
								logoUrl={organization.logo}
								className="size-10 rounded-lg"
							/>
							<span className="font-medium flex-1 truncate">{organization.name}</span>
							<ChevronRightIcon className="size-4 text-foreground/50" aria-hidden="true" />
						</Card>
					</Link>
				))}
				<div>
					<Button
						variant="secondary"
						nativeButton={false}
						render={<Link to="/orgs/new" search={true} />}
					>
						<PlusIcon aria-hidden="true" />
						{t("organizations.list.create")}
					</Button>
				</div>
			</div>
		</div>
	);
}
