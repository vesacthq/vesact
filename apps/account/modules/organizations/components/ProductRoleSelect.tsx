import { useTranslations } from "@i18n/intl";
import { useProductRoleOptions } from "@organizations/hooks/member-roles";
import { type Product, type ProductRole, productRoles } from "@repo/permissions";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";

const NONE = "none";

/** One select per product: no access, or one of the product's roles. */
export function ProductRoleSelect({
	id,
	product,
	value,
	onSelect,
	disabled,
}: {
	id?: string;
	product: Product;
	value: ProductRole | null;
	onSelect: (value: ProductRole | null) => void;
	disabled?: boolean;
}) {
	const t = useTranslations();
	const options = [
		{ value: NONE, label: t("organizations.productAccess.none") },
		...useProductRoleOptions(product),
	];

	return (
		<Select
			value={value ?? NONE}
			items={options}
			onValueChange={(selected) => {
				if (selected === NONE) {
					onSelect(null);
					return;
				}
				const role = productRoles[product].find((candidate) => candidate === selected);
				if (role) {
					onSelect(role);
				}
			}}
			disabled={disabled}
		>
			<SelectTrigger id={id}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value} label={option.label}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
