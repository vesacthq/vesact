import { useTranslations } from "@i18n/intl";
import { useOrganization } from "@organizations/hooks/use-organization";
import { ActivePlan } from "@payments/components/ActivePlan";
import { ChangePlan } from "@payments/components/ChangePlan";
import { usePurchases } from "@payments/hooks/purchases";
import { checkPermission, serializeMemberRoles } from "@repo/permissions";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { PageHeader } from "@shared/components/PageHeader";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { CreditCardIcon, LockIcon } from "lucide-react";

const loadPaymentAvailabilityFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => {
		const { availability } = await import("@repo/api/modules/payments/procedures/availability");
		return availability.callable({ context: { headers: new Headers() } })();
	},
);

export const Route = createFileRoute("/_authenticated/_settings/orgs/$organizationSlug/billing/")({
	loader: async () => ({ availability: await loadPaymentAvailabilityFn() }),
	component: OrganizationBillingPage,
	head: () => ({ meta: [{ title: documentTitle("Billing") }] }),
});

function OrganizationBillingPage() {
	const t = useTranslations();
	const { availability } = Route.useLoaderData();
	const { organization, roles } = useOrganization();
	const { activePlan } = usePurchases(organization.id);
	const canManageBilling = checkPermission(
		{ membershipRole: serializeMemberRoles(roles) },
		"organization.manageBilling",
	);

	if (!canManageBilling) {
		return (
			<Alert>
				<LockIcon />
				<AlertTitle>{t("settings.billing.noPermission")}</AlertTitle>
			</Alert>
		);
	}

	return (
		<div>
			<PageHeader title={t("settings.billing.title")} subtitle={t("settings.billing.subtitle")} />
			<SettingsList>
				<ActivePlan organizationId={organization.id} />
				{availability.checkout ? (
					<ChangePlan
						organizationId={organization.id}
						organizationSlug={organization.slug}
						activePlanId={activePlan?.id}
					/>
				) : (
					<Alert>
						<CreditCardIcon />
						<AlertTitle>{t("settings.billing.unavailable.title")}</AlertTitle>
						<AlertDescription>{t("settings.billing.unavailable.description")}</AlertDescription>
					</Alert>
				)}
			</SettingsList>
		</div>
	);
}
