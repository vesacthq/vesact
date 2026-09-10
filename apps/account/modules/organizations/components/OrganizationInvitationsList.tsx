import { useSession } from "@auth/hooks/use-session";
import { useFormatter, useTranslations } from "@i18n/intl";
import { useOrganization } from "@organizations/hooks/use-organization";
import { authClient } from "@repo/auth/client";
import { checkPermission, parseMemberRoles, serializeMemberRoles } from "@repo/permissions";
import { Button } from "@repo/ui/components/button";
import { Table, TableBody, TableCell, TableRow } from "@repo/ui/components/table";
import { toast } from "@repo/ui/components/toast";
import { ClockIcon, MailXIcon } from "lucide-react";
import { useMemo } from "react";

import { MemberRoleBadges } from "./MemberRoleBadges";

export function OrganizationInvitationsList() {
	const t = useTranslations();
	const formatter = useFormatter();
	const { user } = useSession();
	const { organization, roles: ownRoles, refetch } = useOrganization();

	const canManage = checkPermission(
		{ user, membershipRole: serializeMemberRoles(ownRoles) },
		"organization.manage",
	);

	const invitations = useMemo(
		() =>
			organization.invitations
				.filter((invitation) => invitation.status === "pending")
				.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()),
		[organization.invitations],
	);

	const revokeInvitation = async (invitationId: string) => {
		const cancel = async () => {
			const { error } = await authClient.organization.cancelInvitation({ invitationId });

			if (error) {
				throw error;
			}

			await refetch();
		};

		await toast
			.promise(cancel(), {
				loading: {
					title: t(
						"organizations.settings.members.notifications.revokeInvitation.loading.description",
					),
				},
				success: {
					title: t(
						"organizations.settings.members.notifications.revokeInvitation.success.description",
					),
				},
				error: {
					title: t(
						"organizations.settings.members.notifications.revokeInvitation.error.description",
					),
				},
			})
			.catch(() => undefined);
	};

	return (
		<div className="rounded-2xl border">
			<Table>
				<TableBody>
					{invitations.length === 0 ? (
						<TableRow>
							<TableCell className="h-24 text-center">
								{t("organizations.settings.members.invitations.empty")}
							</TableCell>
						</TableRow>
					) : (
						invitations.map((invitation) => (
							<TableRow key={invitation.id}>
								<TableCell>
									<div className="leading-normal">
										<strong className="block">{invitation.email}</strong>
										<small className="gap-1 flex flex-wrap text-foreground/60">
											<span className="gap-0.5 flex items-center">
												<ClockIcon className="size-3" />
												{t("organizations.settings.members.invitations.invitationStatus.pending")}
											</span>
											<span>-</span>
											<span>
												{t("organizations.settings.members.invitations.expiresAt", {
													date: formatter.dateTime(new Date(invitation.expiresAt), {
														dateStyle: "medium",
														timeStyle: "short",
													}),
												})}
											</span>
										</small>
									</div>
								</TableCell>
								<TableCell>
									<MemberRoleBadges roles={parseMemberRoles(invitation.role)} />
								</TableCell>
								<TableCell className="text-right">
									{canManage && (
										<Button
											size="sm"
											variant="ghost"
											onClick={() => revokeInvitation(invitation.id)}
										>
											<MailXIcon className="size-4" />
											{t("organizations.settings.members.invitations.revoke")}
										</Button>
									)}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
