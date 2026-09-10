import type { ActiveOrganization } from "@repo/auth";
import type { MemberRole } from "@repo/permissions";
import { createContext } from "react";

export const OrganizationContext = createContext<
	| {
			organization: ActiveOrganization;
			/** Roles of the signed-in user in this organization. */
			roles: MemberRole[];
			refetch: () => Promise<void>;
	  }
	| undefined
>(undefined);
