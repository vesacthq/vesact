import { sessionQueryOptions } from "@auth/lib/api";
import { useTranslations } from "@i18n/intl";
import { CreateOrganizationForm } from "@organizations/components/CreateOrganizationForm";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";

// Outside the authenticated layout: that layout requires an organization,
// and this is where the first one comes from.
export const Route = createFileRoute("/orgs/new")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());

		if (!session) {
			throw redirect({ to: "/login", search: { redirectTo: location.href } });
		}
	},
	component: NewOrganizationPage,
	head: () => ({ meta: [{ title: documentTitle("New organization") }] }),
});

function NewOrganizationPage() {
	const t = useTranslations();

	return (
		<AuthWrapper>
			<div className="gap-6 flex flex-col">
				<div>
					<h1 className="text-2xl font-semibold">{t("organizations.create.title")}</h1>
					<p className="mt-1 text-muted-foreground">{t("organizations.create.subtitle")}</p>
				</div>
				<CreateOrganizationForm />
			</div>
		</AuthWrapper>
	);
}
