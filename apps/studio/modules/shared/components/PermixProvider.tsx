import type { PermissionsDefinition } from "@repo/permissions";
import type { Permix } from "permix";
import { PermixProvider as ReactPermixProvider, usePermix } from "permix/react";
import type { ReactNode } from "react";

export function PermixProvider({
	permix,
	children,
}: {
	permix: Permix<PermissionsDefinition>;
	children: ReactNode;
}) {
	return <ReactPermixProvider permix={permix}>{children}</ReactPermixProvider>;
}

export function usePermissions(permix: Permix<PermissionsDefinition>) {
	return usePermix(permix);
}
