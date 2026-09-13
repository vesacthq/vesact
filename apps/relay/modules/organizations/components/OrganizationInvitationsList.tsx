import { useFormatter, useTranslations } from "@i18n/intl";
import {
	invitationLink,
	memberErrorKey,
	useCancelInvitationMutation,
} from "@organizations/lib/members";
import { memberRole } from "@organizations/lib/roles";
import type { ActiveOrganization } from "@repo/relay/auth";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/reui/badge";
import { Separator } from "@repo/ui/components/separator";
import { toast } from "@repo/ui/components/toast";
import { useConfirmationAlert } from "@shared/components/ConfirmationAlertProvider";
import { CheckIcon, LinkIcon, MailXIcon } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

type Invitation = ActiveOrganization["invitations"][number];

export function OrganizationInvitationsList({
	organization,
	canManage,
}: {
	organization: ActiveOrganization;
	canManage: boolean;
}) {
	const t = useTranslations();
	const formatter = useFormatter();
	const { confirm } = useConfirmationAlert();
	const cancelInvitation = useCancelInvitationMutation(organization);
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [now] = useState(() => Date.now());

	const invitations = useMemo(
		() =>
			organization.invitations
				.filter((invitation) => invitation.status === "pending")
				.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()),
		[organization.invitations],
	);

	const copyLink = async (invitation: Invitation) => {
		await navigator.clipboard.writeText(invitationLink(invitation.id));
		setCopiedId(invitation.id);
	};

	const revoke = (invitation: Invitation) => {
		confirm({
			title: t("organizations.invitations.revoke.title"),
			message: t("organizations.invitations.revoke.message", { email: invitation.email }),
			confirmLabel: t("organizations.invitations.revoke.confirm"),
			destructive: true,
			onConfirm: () =>
				toast
					.promise(cancelInvitation.mutateAsync({ invitationId: invitation.id }), {
						loading: { title: t("organizations.invitations.revoke.loading") },
						success: { title: t("organizations.invitations.revoke.success") },
						error: (error) => {
							const key = memberErrorKey(error);
							return {
								title: key
									? t(`organizations.members.errors.${key}`)
									: t("organizations.invitations.revoke.error"),
							};
						},
					})
					.catch(() => undefined),
		});
	};

	if (invitations.length === 0) {
		return (
			<p className="p-8 text-sm text-center text-muted-foreground">
				{t("organizations.invitations.list.empty")}
			</p>
		);
	}

	return invitations.map((invitation, index) => {
		const expiresAt = new Date(invitation.expiresAt);
		const expired = expiresAt.getTime() < now;

		return (
			<Fragment key={invitation.id}>
				{index > 0 && <Separator />}
				<div className="gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center grid">
					<div className="min-w-0 gap-1 flex flex-col">
						<span className="text-sm font-medium truncate">{invitation.email}</span>
						<span className="text-xs text-muted-foreground">
							{t(
								expired
									? "organizations.invitations.list.expired"
									: "organizations.invitations.list.expires",
								{
									date: formatter.dateTime(expiresAt, { dateStyle: "medium", timeStyle: "short" }),
								},
							)}
						</span>
					</div>
					<Badge variant="outline">{t(`organizations.roles.${memberRole(invitation.role)}`)}</Badge>
					{canManage && (
						<div className="gap-1 flex justify-end">
							{!expired && (
								<Button variant="ghost" size="sm" onClick={() => copyLink(invitation)}>
									{copiedId === invitation.id ? (
										<CheckIcon className="size-4" aria-hidden="true" />
									) : (
										<LinkIcon className="size-4" aria-hidden="true" />
									)}
									{copiedId === invitation.id
										? t("organizations.invitations.list.copied")
										: t("organizations.invitations.list.copyLink")}
								</Button>
							)}
							<Button variant="ghost" size="sm" onClick={() => revoke(invitation)}>
								<MailXIcon className="size-4" aria-hidden="true" />
								{t("organizations.invitations.list.revoke")}
							</Button>
						</div>
					)}
				</div>
			</Fragment>
		);
	});
}
