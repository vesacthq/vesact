import { useOrganizationRoleOptions } from "@organizations/hooks/member-roles";
import { isOrganizationRole, type OrganizationRole } from "@repo/permissions";
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
}: {
	value: OrganizationRole;
	onSelect: (value: OrganizationRole) => void;
	disabled?: boolean;
	allowOwner?: boolean;
}) {
	const options = useOrganizationRoleOptions().filter(
		(option) => allowOwner || option.value !== "owner" || option.value === value,
	);

	return (
		<Select
			value={value}
			items={options}
			onValueChange={(selected) => {
				if (typeof selected === "string" && isOrganizationRole(selected)) {
					onSelect(selected);
				}
			}}
			disabled={disabled}
		>
			<SelectTrigger>
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
