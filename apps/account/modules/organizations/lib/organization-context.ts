import type { ActiveOrganization } from "@repo/auth";
import type { OrganizationRole } from "@repo/permissions";
import { createContext } from "react";

export const OrganizationContext = createContext<
	| {
			organization: ActiveOrganization;
			/** Role of the signed-in user in this organization. */
			role: OrganizationRole | null;
			refetch: () => Promise<void>;
	  }
	| undefined
>(undefined);
