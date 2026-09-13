import { useSession } from "@auth/hooks/use-session";
import { useTranslations } from "@i18n/intl";
import { organizationQueryOptions } from "@organizations/lib/api";
import { canManageMembers, memberRole } from "@organizations/lib/roles";
import { Button } from "@repo/ui/components/button";
import {
	Frame,
	FrameDescription,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@repo/ui/components/reui/frame";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";

import { InviteMemberDialog } from "./InviteMemberDialog";
import { OrganizationInvitationsList } from "./OrganizationInvitationsList";
import { OrganizationMembersList } from "./OrganizationMembersList";

export function OrganizationMembersBlock({ organizationSlug }: { organizationSlug: string }) {
	const t = useTranslations();
	const { user } = useSession();
	const { data: organization } = useSuspenseQuery(organizationQueryOptions(organizationSlug));
	const [inviteOpen, setInviteOpen] = useState(false);

	if (!organization) {
		return null;
	}

	const ownRole = memberRole(
		organization.members.find((member) => member.userId === user.id)?.role,
	);
	const canManage = canManageMembers(ownRole);

	return (
		<div className="gap-6 flex flex-col">
			<Frame stacked spacing="sm">
				<FrameHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0 gap-0.5 flex flex-col">
						<FrameTitle>{t("organizations.members.list.title")}</FrameTitle>
						<FrameDescription>{t("organizations.members.list.description")}</FrameDescription>
					</div>
					{canManage && (
						<Button size="sm" className="shrink-0" onClick={() => setInviteOpen(true)}>
							<UserPlusIcon className="size-4" aria-hidden="true" />
							{t("organizations.invitations.create.button")}
						</Button>
					)}
				</FrameHeader>
				<FramePanel className="p-0">
					<OrganizationMembersList organization={organization} userId={user.id} ownRole={ownRole} />
				</FramePanel>
			</Frame>
			{canManage && (
				<Frame stacked spacing="sm">
					<FrameHeader>
						<FrameTitle>{t("organizations.invitations.list.title")}</FrameTitle>
						<FrameDescription>{t("organizations.invitations.list.description")}</FrameDescription>
					</FrameHeader>
					<FramePanel className="p-0">
						<OrganizationInvitationsList organization={organization} canManage={canManage} />
					</FramePanel>
				</Frame>
			)}
			{canManage && (
				<InviteMemberDialog
					organization={organization}
					allowOwner={ownRole === "owner"}
					open={inviteOpen}
					onOpenChange={setInviteOpen}
				/>
			)}
		</div>
	);
}
