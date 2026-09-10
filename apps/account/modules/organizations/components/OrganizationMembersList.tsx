import { useSession } from "@auth/hooks/use-session";
import { useTranslations } from "@i18n/intl";
import { productNames } from "@organizations/hooks/member-roles";
import { useOrganization } from "@organizations/hooks/use-organization";
import { authClient } from "@repo/auth/client";
import {
	checkPermission,
	getOrganizationRole,
	getProductRole,
	type MemberRole,
	parseMemberRoles,
	products,
	serializeMemberRoles,
	withOrganizationRole,
	withProductRole,
} from "@repo/permissions";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import { toast } from "@repo/ui/components/toast";
import { UserAvatar } from "@shared/components/UserAvatar";
import { LogOutIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";

import { MemberRoleBadges } from "./MemberRoleBadges";
import { OrganizationRoleSelect } from "./OrganizationRoleSelect";
import { ProductRoleSelect } from "./ProductRoleSelect";

export function OrganizationMembersList() {
	const t = useTranslations();
	const { user } = useSession();
	const { organization, roles: ownRoles, refetch } = useOrganization();

	const canManage = checkPermission(
		{ user, membershipRole: serializeMemberRoles(ownRoles) },
		"organization.manage",
	);
	const isOwner = getOrganizationRole(ownRoles) === "owner";

	const updateRoles = async (memberId: string, roles: MemberRole[]) => {
		const update = async () => {
			const { error } = await authClient.organization.updateMemberRole({
				memberId,
				role: roles,
				organizationId: organization.id,
			});

			if (error) {
				throw error;
			}

			await refetch();
		};

		await toast
			.promise(update(), {
				loading: {
					title: t(
						"organizations.settings.members.notifications.updateMembership.loading.description",
					),
				},
				success: {
					title: t(
						"organizations.settings.members.notifications.updateMembership.success.description",
					),
				},
				error: {
					title: t(
						"organizations.settings.members.notifications.updateMembership.error.description",
					),
				},
			})
			.catch(() => undefined);
	};

	const removeMember = async (memberId: string) => {
		const remove = async () => {
			const { error } = await authClient.organization.removeMember({
				memberIdOrEmail: memberId,
				organizationId: organization.id,
			});

			if (error) {
				throw error;
			}

			await refetch();
		};

		await toast
			.promise(remove(), {
				loading: {
					title: t("organizations.settings.members.notifications.removeMember.loading.description"),
				},
				success: {
					title: t("organizations.settings.members.notifications.removeMember.success.description"),
				},
				error: {
					title: t("organizations.settings.members.notifications.removeMember.error.description"),
				},
			})
			.catch(() => undefined);
	};

	return (
		<div className="overflow-x-auto rounded-2xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t("organizations.settings.members.columns.member")}</TableHead>
						<TableHead>{t("organizations.settings.members.columns.organization")}</TableHead>
						{products.map((product) => (
							<TableHead key={product}>{productNames[product]}</TableHead>
						))}
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{organization.members.length === 0 ? (
						<TableRow>
							<TableCell colSpan={3 + products.length} className="h-24 text-center">
								{t("organizations.settings.members.empty")}
							</TableCell>
						</TableRow>
					) : (
						organization.members.map((member) => {
							const roles = parseMemberRoles(member.role);
							const organizationRole = getOrganizationRole(roles) ?? "member";
							const memberIsOwner = organizationRole === "owner";
							const isOrganizationAdmin = memberIsOwner || organizationRole === "admin";
							const isSelf = member.userId === user?.id;

							return (
								<TableRow key={member.id}>
									<TableCell>
										<div className="gap-2 flex items-center">
											<UserAvatar
												name={member.user.name ?? member.user.email}
												avatarUrl={member.user.image}
											/>
											<div className="min-w-0">
												<strong className="block truncate">{member.user.name}</strong>
												<small className="block truncate text-foreground/60">
													{member.user.email}
												</small>
											</div>
										</div>
									</TableCell>
									{canManage ? (
										<>
											<TableCell>
												<OrganizationRoleSelect
													value={organizationRole}
													disabled={memberIsOwner}
													allowOwner={isOwner}
													onSelect={(role) =>
														updateRoles(member.id, withOrganizationRole(roles, role))
													}
												/>
											</TableCell>
											{products.map((product) => (
												<TableCell key={product}>
													{isOrganizationAdmin ? (
														<span
															className="text-sm text-foreground/60"
															title={t("organizations.productAccess.fullDescription")}
														>
															{t("organizations.productAccess.full")}
														</span>
													) : (
														<ProductRoleSelect
															product={product}
															value={getProductRole(roles, product)}
															onSelect={(role) =>
																updateRoles(member.id, withProductRole(roles, product, role))
															}
														/>
													)}
												</TableCell>
											))}
										</>
									) : (
										<TableCell colSpan={1 + products.length}>
											<MemberRoleBadges roles={roles} />
										</TableCell>
									)}
									<TableCell className="text-right">
										{(canManage || isSelf) && (
											<DropdownMenu>
												<DropdownMenuTrigger
													render={(props) => (
														<Button {...props} size="icon" variant="ghost">
															<MoreVerticalIcon className="size-4" />
														</Button>
													)}
												/>
												<DropdownMenuContent>
													{isSelf ? (
														<DropdownMenuItem
															variant="destructive"
															onClick={() => removeMember(member.id)}
														>
															<LogOutIcon className="size-4" />
															{t("organizations.settings.members.leaveOrganization")}
														</DropdownMenuItem>
													) : (
														<DropdownMenuItem
															variant="destructive"
															onClick={() => removeMember(member.id)}
														>
															<TrashIcon className="size-4" />
															{t("organizations.settings.members.removeMember")}
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		</div>
	);
}
