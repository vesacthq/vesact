import { authClient } from "@repo/relay/auth/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { organizationQueryKey } from "./api";
import type { OrganizationRole } from "./roles";

interface OrganizationRef {
	id: string;
	slug: string;
}

/** Relay sends no invitation email; the inviter shares this link. */
export function invitationLink(invitationId: string) {
	return `${window.location.origin}/invitations/${invitationId}`;
}

const errorKeys = {
	YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: "lastOwner",
	YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER: "lastOwner",
	USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: "alreadyMember",
	USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: "alreadyInvited",
	YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION: "notAllowed",
	YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE: "notAllowed",
	YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: "notAllowed",
	YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: "notAllowed",
	YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: "notAllowed",
} as const;

export type MemberErrorKey = (typeof errorKeys)[keyof typeof errorKeys];

/** The Better Auth error codes a user can run into from the members page. */
export function memberErrorKey(error: unknown): MemberErrorKey | null {
	const code = (error as { code?: unknown } | null)?.code;

	return typeof code === "string" && code in errorKeys
		? errorKeys[code as keyof typeof errorKeys]
		: null;
}

function useInvalidateOrganization(slug: string) {
	const queryClient = useQueryClient();

	return () => queryClient.invalidateQueries({ queryKey: organizationQueryKey(slug) });
}

export function useInviteMemberMutation(organization: OrganizationRef) {
	const invalidate = useInvalidateOrganization(organization.slug);

	return useMutation({
		mutationFn: async ({ email, role }: { email: string; role: OrganizationRole }) => {
			const { data, error } = await authClient.organization.inviteMember({
				email,
				role,
				organizationId: organization.id,
			});

			if (error) {
				throw error;
			}

			return data;
		},
		onSuccess: invalidate,
	});
}

export function useCancelInvitationMutation(organization: OrganizationRef) {
	const invalidate = useInvalidateOrganization(organization.slug);

	return useMutation({
		mutationFn: async ({ invitationId }: { invitationId: string }) => {
			const { error } = await authClient.organization.cancelInvitation({ invitationId });

			if (error) {
				throw error;
			}
		},
		onSuccess: invalidate,
	});
}

export function useUpdateMemberRoleMutation(organization: OrganizationRef) {
	const invalidate = useInvalidateOrganization(organization.slug);

	return useMutation({
		mutationFn: async ({ memberId, role }: { memberId: string; role: OrganizationRole }) => {
			const { error } = await authClient.organization.updateMemberRole({
				memberId,
				role,
				organizationId: organization.id,
			});

			if (error) {
				throw error;
			}
		},
		onSuccess: invalidate,
	});
}

export function useRemoveMemberMutation(organization: OrganizationRef) {
	const invalidate = useInvalidateOrganization(organization.slug);

	return useMutation({
		mutationFn: async ({ memberId }: { memberId: string }) => {
			const { error } = await authClient.organization.removeMember({
				memberIdOrEmail: memberId,
				organizationId: organization.id,
			});

			if (error) {
				throw error;
			}
		},
		onSuccess: invalidate,
	});
}

export function useLeaveOrganizationMutation(organization: OrganizationRef) {
	return useMutation({
		mutationFn: async () => {
			const { error } = await authClient.organization.leave({ organizationId: organization.id });

			if (error) {
				throw error;
			}
		},
	});
}
