import { useTranslations } from "@i18n/intl";
import { useActiveOrganizationQuery } from "@organizations/lib/api";
import { ActivePlan } from "@payments/components/ActivePlan";
import { ChangePlan } from "@payments/components/ChangePlan";
import { config as authConfig } from "@repo/auth/config";
import { config as paymentsConfig } from "@repo/payments/config";
import { SettingsList } from "@shared/components/SettingsList";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/$organizationSlug/settings/billing/")({
	beforeLoad: ({ params }) => {
		if (!authConfig.organizations.enable) {
			throw redirect({ to: "/" });
		}
		if (paymentsConfig.billingAttachedTo !== "organization") {
			throw redirect({
				to: "/$organizationSlug/settings/general",
				params: { organizationSlug: params.organizationSlug },
			});
		}
	},
	component: OrgSettingsBillingPage,
	head: () => ({ meta: [{ title: "Organization — Billing" }] }),
});

function OrgSettingsBillingPage() {
	const { organizationSlug } = Route.useParams();
	const t = useTranslations();
	const { data, isError, isLoading } = useActiveOrganizationQuery(
		{ slug: organizationSlug },
		{ enabled: Boolean(organizationSlug) },
	);

	if (isError || !data) {
		return isLoading ? (
			<p className="text-sm text-muted-foreground">…</p>
		) : (
			<p className="text-sm text-destructive">Could not load organization.</p>
		);
	}

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">{t("settings.menu.organization.billing")}</h2>
			<SettingsList>
				<ActivePlan organizationId={data.id} />
				<ChangePlan organizationId={data.id} />
			</SettingsList>
		</div>
	);
}
