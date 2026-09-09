import { useOrganizationMemberRoleOptions } from "@organizations/hooks/member-roles";
import type { OrganizationMemberRole } from "@repo/auth";
import { organizationMemberRoleOrder } from "@repo/auth/lib/organization-member-role-order";
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
	value?: OrganizationMemberRole;
	onSelect: (value: OrganizationMemberRole) => void;
	disabled?: boolean;
}) {
	const roleOptions = useOrganizationMemberRoleOptions();

	return (
		<Select
			value={value}
			items={roleOptions}
			onValueChange={(selectedValue) => {
				const matchingRole = organizationMemberRoleOrder.find((role) => role === selectedValue);
				if (matchingRole === undefined) {
					return;
				}
				onSelect(matchingRole);
			}}
			disabled={disabled}
		>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{roleOptions.map((option) => (
					<SelectItem key={option.value} value={option.value} label={option.label}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
