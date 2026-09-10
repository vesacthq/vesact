import { useTranslations } from "@i18n/intl";
import { CreateOrganizationForm } from "@organizations/components/CreateOrganizationForm";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_settings/orgs/new/")({
	component: NewOrganizationPage,
	head: () => ({ meta: [{ title: documentTitle("New organization") }] }),
});

function NewOrganizationPage() {
	const t = useTranslations();

	return (
		<div>
			<PageHeader
				title={t("organizations.createForm.title")}
				subtitle={t("organizations.createForm.subtitle")}
			/>
			<CreateOrganizationForm />
		</div>
	);
}
