import { createServerFn } from "@tanstack/react-start";

import { permix } from "./permix";

/** RPC bridge for dehydrating request-scoped Permix state (safe to import from routes). */
export const getPermixState = createServerFn({ method: "GET", strict: false }).handler(
	({ context }) => permix.dehydrate(context),
);
