import { useTranslations } from "@i18n/intl";
import {
	organizationRoles,
	type Product,
	type ProductRole,
	productRoles,
	products,
} from "@repo/permissions";

export const productNames: Record<Product, string> = {
	studio: "Studio",
	relay: "Relay",
};

export function useOrganizationRoleOptions() {
	const t = useTranslations();

	return organizationRoles.map((role) => ({
		value: role,
		label: t(`organizations.roles.${role}`),
	}));
}

export function useProductRoleLabel() {
	const t = useTranslations();

	return (role: ProductRole) => {
		const [product, name] = role.split(":") as [Product, string];
		return t(`organizations.productRoles.${product}.${name}` as never);
	};
}

export function useProductRoleOptions(product: Product) {
	const label = useProductRoleLabel();

	return productRoles[product].map((role) => ({ value: role, label: label(role) }));
}

export { products };
