import { useTranslations } from "@i18n/intl";
import { organizationRoles } from "@repo/permissions";

export function useOrganizationRoleOptions() {
	const t = useTranslations();

	return organizationRoles.map((role) => ({
		value: role,
		label: t(`organizations.roles.${role}`),
	}));
}
