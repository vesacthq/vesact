import { useTranslations } from "@i18n/intl";
import {
	isOrganizationRole,
	type OrganizationRole,
	organizationRoles,
} from "@organizations/lib/roles";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";

/** Only an owner can hand out the owner role; Better Auth rejects it otherwise. */
export function OrganizationRoleSelect({
	value,
	onSelect,
	disabled,
	allowOwner = false,
	size,
	...props
}: {
	value: OrganizationRole;
	onSelect: (value: OrganizationRole) => void;
	disabled?: boolean;
	allowOwner?: boolean;
	size?: "sm" | "default";
	id?: string;
	"aria-label"?: string;
}) {
	const t = useTranslations();
	const options = organizationRoles
		.filter((role) => allowOwner || role !== "owner" || role === value)
		.map((role) => ({ value: role, label: t(`organizations.roles.${role}`) }));

	return (
		<Select
			value={value}
			items={options}
			onValueChange={(selected) => {
				if (isOrganizationRole(selected) && selected !== value) {
					onSelect(selected);
				}
			}}
			disabled={disabled}
		>
			<SelectTrigger size={size} {...props}>
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
