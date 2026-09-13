import { sessionQueryOptions } from "@auth/lib/api";
import { useTranslations } from "@i18n/intl";
import { organizationListQueryOptions, organizationQueryKey } from "@organizations/lib/api";
import {
	memberErrorKey,
	useLeaveOrganizationMutation,
	useRemoveMemberMutation,
	useUpdateMemberRoleMutation,
} from "@organizations/lib/members";
import { canManageMembers, memberRole, type OrganizationRole } from "@organizations/lib/roles";
import type { ActiveOrganization } from "@repo/relay/auth";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Badge } from "@repo/ui/components/reui/badge";
import { Separator } from "@repo/ui/components/separator";
import { toast } from "@repo/ui/components/toast";
import { useConfirmationAlert } from "@shared/components/ConfirmationAlertProvider";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LogOutIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { Fragment } from "react";

import { OrganizationRoleSelect } from "./OrganizationRoleSelect";

type Member = ActiveOrganization["members"][number];

export function OrganizationMembersList({
	organization,
	userId,
	ownRole,
}: {
	organization: ActiveOrganization;
	userId: string;
	ownRole: OrganizationRole;
}) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();
	const updateMemberRole = useUpdateMemberRoleMutation(organization);
	const removeMember = useRemoveMemberMutation(organization);
	const leaveOrganization = useLeaveOrganizationMutation(organization);

	const canManage = canManageMembers(ownRole);
	const isOwner = ownRole === "owner";

	const errorTitle = (fallback: string) => (error: unknown) => {
		const key = memberErrorKey(error);
		return { title: key ? t(`organizations.members.errors.${key}`) : fallback };
	};

	const changeRole = (member: Member, role: OrganizationRole) =>
		toast
			.promise(updateMemberRole.mutateAsync({ memberId: member.id, role }), {
				loading: { title: t("organizations.members.updateRole.loading") },
				success: { title: t("organizations.members.updateRole.success") },
				error: errorTitle(t("organizations.members.updateRole.error")),
			})
			.catch(() => undefined);

	const remove = (member: Member) => {
		confirm({
			title: t("organizations.members.remove.title"),
			message: t("organizations.members.remove.message", {
				name: member.user.name || member.user.email,
			}),
			confirmLabel: t("organizations.members.remove.confirm"),
			destructive: true,
			onConfirm: () =>
				toast
					.promise(removeMember.mutateAsync({ memberId: member.id }), {
						loading: { title: t("organizations.members.remove.loading") },
						success: { title: t("organizations.members.remove.success") },
						error: errorTitle(t("organizations.members.remove.error")),
					})
					.catch(() => undefined),
		});
	};

	const leave = () => {
		confirm({
			title: t("organizations.members.leave.title"),
			message: t("organizations.members.leave.message", { name: organization.name }),
			confirmLabel: t("organizations.members.leave.confirm"),
			destructive: true,
			onConfirm: async () => {
				try {
					await leaveOrganization.mutateAsync();
				} catch (error) {
					toast.add({
						...errorTitle(t("organizations.members.leave.error"))(error),
						type: "error",
					});
					return;
				}

				// The layout reads the list and the session from the route context,
				// so both are refreshed here before the navigation that re-runs it.
				queryClient.removeQueries({ queryKey: organizationQueryKey(organization.slug) });
				queryClient.setQueryData(sessionQueryOptions().queryKey, (current) =>
					current && current.session.activeOrganizationId === organization.id
						? { ...current, session: { ...current.session, activeOrganizationId: null } }
						: current,
				);
				await queryClient.fetchQuery({ ...organizationListQueryOptions(), staleTime: 0 });
				void router.navigate({ to: "/", replace: true });
			},
		});
	};

	return organization.members.length === 0 ? (
		<p className="p-8 text-sm text-center text-muted-foreground">
			{t("organizations.members.list.empty")}
		</p>
	) : (
		organization.members.map((member, index) => {
			const role = memberRole(member.role);
			const isSelf = member.userId === userId;
			const canEditRole = canManage && (role !== "owner" || isOwner);
			const canRemove = !isSelf && canManage && (role !== "owner" || isOwner);
			const name = member.user.name || member.user.email;

			return (
				<Fragment key={member.id}>
					{index > 0 && <Separator />}
					<div className="gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center grid">
						<div className="min-w-0 gap-3 flex items-center">
							<UserAvatar name={name} avatarUrl={member.user.image} />
							<div className="min-w-0">
								<div className="gap-2 flex flex-wrap items-center">
									<span className="text-sm font-medium truncate">{name}</span>
									{isSelf && (
										<Badge variant="secondary" size="xs">
											{t("organizations.members.list.you")}
										</Badge>
									)}
								</div>
								<span className="text-xs block truncate text-muted-foreground">
									{member.user.email}
								</span>
							</div>
						</div>
						{canEditRole ? (
							<OrganizationRoleSelect
								size="sm"
								value={role}
								allowOwner={isOwner}
								aria-label={t("organizations.members.list.role")}
								onSelect={(next) => changeRole(member, next)}
							/>
						) : (
							<Badge variant="outline">{t(`organizations.roles.${role}`)}</Badge>
						)}
						<div className="min-w-8 flex justify-end">
							{(isSelf || canRemove) && (
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												size="icon-sm"
												variant="ghost"
												aria-label={t("common.aria.openMenu")}
											/>
										}
									>
										<MoreVerticalIcon className="size-4" aria-hidden="true" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{isSelf ? (
											<DropdownMenuItem variant="destructive" onClick={leave}>
												<LogOutIcon aria-hidden="true" />
												{t("organizations.members.leave.action")}
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem variant="destructive" onClick={() => remove(member)}>
												<TrashIcon aria-hidden="true" />
												{t("organizations.members.remove.action")}
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>
				</Fragment>
			);
		})
	);
}
