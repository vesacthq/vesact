import { useTranslations } from "@i18n/intl";
import { ActivePlan } from "@payments/components/ActivePlan";
import { ChangePlan } from "@payments/components/ChangePlan";
import { config as paymentsConfig } from "@repo/payments/config";
import { SettingsList } from "@shared/components/SettingsList";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/settings/billing/")({
	beforeLoad: () => {
		if (paymentsConfig.billingAttachedTo !== "user") {
			throw redirect({ to: "/settings/general" });
		}
	},
	component: SettingsBillingPage,
	head: () => ({ meta: [{ title: documentTitle("Settings — Billing") }] }),
});

function SettingsBillingPage() {
	const t = useTranslations();

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">{t("settings.menu.account.billing")}</h2>
			<SettingsList>
				<ActivePlan />
				<ChangePlan />
			</SettingsList>
		</div>
	);
}
