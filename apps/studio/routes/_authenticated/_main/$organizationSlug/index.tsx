import { useTranslations } from "@i18n/intl";
import { OrganizationStart } from "@organizations/components/OrganizationStart";
import { useActiveOrganizationQuery } from "@organizations/lib/api";
import { config as authConfig } from "@repo/auth/config";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/_main/$organizationSlug/")({
	beforeLoad: () => {
		if (!authConfig.organizations.enable) {
			throw redirect({ to: "/" });
		}
	},
	component: OrganizationHomePage,
	head: () => ({ meta: [{ title: documentTitle("Organization") }] }),
});

function OrganizationHomePage() {
	const { organizationSlug } = Route.useParams();
	const t = useTranslations();
	const { data, isError, isLoading } = useActiveOrganizationQuery(
		{ slug: organizationSlug },
		{ enabled: Boolean(organizationSlug) },
	);

	const title = useMemo(() => {
		if (data?.name) {
			return data.name;
		}
		return organizationSlug;
	}, [data?.name, organizationSlug]);

	if (isError) {
		return (
			<div className="p-2">
				<p className="text-sm text-destructive">
					{t("start.subtitle", { default: "Could not load this organization." })}
				</p>
			</div>
		);
	}

	if (isLoading) {
		return <div className="p-2 text-sm text-muted-foreground">…</div>;
	}

	return (
		<div>
			<PageHeader title={title} subtitle={t("organizations.start.subtitle")} />
			<div className="mt-6">
				<OrganizationStart />
			</div>
		</div>
	);
}
