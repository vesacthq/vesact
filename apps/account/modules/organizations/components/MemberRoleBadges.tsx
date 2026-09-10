import { useTranslations } from "@i18n/intl";
import { productNames, useProductRoleLabel } from "@organizations/hooks/member-roles";
import {
	getOrganizationRole,
	getProductRole,
	type MemberRole,
	productOfRole,
	products,
} from "@repo/permissions";
import { Badge } from "@repo/ui/components/badge";

/** Read-only summary of a role list: the organization role plus one badge per product. */
export function MemberRoleBadges({ roles }: { roles: MemberRole[] }) {
	const t = useTranslations();
	const productRoleLabel = useProductRoleLabel();
	const organizationRole = getOrganizationRole(roles);
	const isOrganizationAdmin = organizationRole === "owner" || organizationRole === "admin";

	return (
		<div className="gap-1 flex flex-wrap">
			{organizationRole && (
				<Badge variant="secondary">{t(`organizations.roles.${organizationRole}`)}</Badge>
			)}
			{isOrganizationAdmin ? (
				<Badge variant="outline">{t("organizations.productAccess.full")}</Badge>
			) : (
				products.map((product) => {
					const role = getProductRole(roles, product);
					return role ? (
						<Badge key={product} variant="outline">
							{productNames[productOfRole(role)]}: {productRoleLabel(role)}
						</Badge>
					) : null;
				})
			)}
		</div>
	);
}
