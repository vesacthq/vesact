import { logger } from "@repo/logs";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

const databaseUrl =
	process.env.RELAY_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/vesact_relay";

// Workers bind a socket to the request that opened it, so a pooled connection
// cannot survive into the next request; retiring a client after one checkout
// keeps every socket inside one request and Hyperdrive does the pooling.
const isWorkerd = globalThis.navigator?.userAgent === "Cloudflare-Workers";

export const db = drizzle({
	connection: { connectionString: databaseUrl, maxUses: isWorkerd ? 1 : undefined },
	schema,
});

db.$client.on("error", (error) => {
	logger.error(error, { ctx: "relay-database-pool" });
});
