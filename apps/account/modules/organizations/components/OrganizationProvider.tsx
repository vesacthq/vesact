import { useSession } from "@auth/hooks/use-session";
import {
	organizationListQueryKey,
	organizationQueryKey,
	useOrganizationQuery,
} from "@organizations/lib/api";
import type { ActiveOrganization } from "@repo/auth";
import { parseMemberRole } from "@repo/permissions";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { OrganizationContext } from "../lib/organization-context";

export function OrganizationProvider({
	initialOrganization,
	children,
}: {
	initialOrganization: ActiveOrganization;
	children: ReactNode;
}) {
	const queryClient = useQueryClient();
	const { user } = useSession();
	const { data } = useOrganizationQuery(initialOrganization.slug, initialOrganization);
	const organization = data ?? initialOrganization;

	const membership = organization.members.find((member) => member.userId === user?.id);

	return (
		<OrganizationContext.Provider
			value={{
				organization,
				role: parseMemberRole(membership?.role),
				refetch: async () => {
					await Promise.all([
						queryClient.invalidateQueries({ queryKey: organizationQueryKey(organization.slug) }),
						queryClient.invalidateQueries({ queryKey: organizationListQueryKey }),
					]);
				},
			}}
		>
			{children}
		</OrganizationContext.Provider>
	);
}
