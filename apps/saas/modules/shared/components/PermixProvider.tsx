import type { PermissionsDefinition } from "@repo/permissions";
import type { DehydratedState, Permix } from "permix";
import { PermixHydrate, PermixProvider as ReactPermixProvider, usePermix } from "permix/react";
import type { ReactNode } from "react";

export function PermixProvider({
	permix,
	state,
	children,
}: {
	permix: Permix<PermissionsDefinition>;
	state: DehydratedState<PermissionsDefinition>;
	children: ReactNode;
}) {
	return (
		<ReactPermixProvider permix={permix}>
			<PermixHydrate state={state}>{children}</PermixHydrate>
		</ReactPermixProvider>
	);
}

export function usePermissions(permix: Permix<PermissionsDefinition>) {
	return usePermix(permix);
}
