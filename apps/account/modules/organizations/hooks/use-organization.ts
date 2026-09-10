import { useContext } from "react";

import { OrganizationContext } from "../lib/organization-context";

export const useOrganization = () => {
	const context = useContext(OrganizationContext);

	if (context === undefined) {
		throw new Error("useOrganization must be used within OrganizationProvider");
	}

	return context;
};
