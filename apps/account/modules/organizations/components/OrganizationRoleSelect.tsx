import { useOrganizationRoleOptions } from "@organizations/hooks/member-roles";
import { isOrganizationRole, type OrganizationRole } from "@repo/permissions";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";

export function OrganizationRoleSelect({
	value,
	onSelect,
	disabled,
}: {
	value: OrganizationRole;
	onSelect: (value: OrganizationRole) => void;
	disabled?: boolean;
}) {
	const options = useOrganizationRoleOptions();

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
