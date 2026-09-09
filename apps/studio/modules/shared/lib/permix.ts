import type { PermissionsDefinition } from "@repo/permissions";
import { createPermix } from "permix/tanstack-start";

export const permix = createPermix<PermissionsDefinition>();
