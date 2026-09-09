import { useTranslations } from "@i18n/intl";
import { PricingTable } from "@payments/components/PricingTable";
import { SettingsItem } from "@shared/components/SettingsItem";

export function ChangePlan({
	organizationId,
	userId,
	activePlanId,
}: {
	organizationId?: string;
	userId?: string;
	activePlanId?: string;
}) {
	const t = useTranslations();

	return (
		<SettingsItem
			title={t("settings.billing.changePlan.title")}
			description={t("settings.billing.changePlan.description")}
		>
			<PricingTable organizationId={organizationId} userId={userId} activePlanId={activePlanId} />
		</SettingsItem>
	);
}
