import { ApiKeysBlock } from "@api-keys/components/ApiKeysBlock";
import { useTranslations } from "@i18n/intl";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";

const organizationRoute = getRouteApi("/_authenticated/$organizationSlug");

export const Route = createFileRoute("/_authenticated/$organizationSlug/settings/api-keys/")({
	component: ApiKeysPage,
	head: () => ({ meta: [{ title: documentTitle("API keys") }] }),
});

function ApiKeysPage() {
	const { organization } = organizationRoute.useLoaderData();
	const t = useTranslations();

	return (
		<div>
			<PageHeader title={t("apiKeys.title")} subtitle={t("apiKeys.subtitle")} />
			<ApiKeysBlock organizationId={organization.id} />
		</div>
	);
}
