import { logger } from "@repo/logs";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

// Check the drizzle documentation for more information on how to connect to your preferred database provider
// https://orm.drizzle.team/docs/get-started-postgresql

const databaseUrl =
	process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/vesact";

// Workers bind a socket to the request that opened it, so a pooled connection
// cannot survive into the next request. Retiring a client after one checkout
// keeps every socket inside one request; Hyperdrive does the real pooling.
// The Node target has no such limit and keeps an ordinary pool.
const isWorkerd = globalThis.navigator?.userAgent === "Cloudflare-Workers";

export const db = drizzle({
	connection: { connectionString: databaseUrl, maxUses: isWorkerd ? 1 : undefined },
	schema,
});

// An idle pooled client whose backend goes away emits "error" on the pool;
// without a listener Node treats it as an uncaught exception and the process
// exits. The client is discarded, the next checkout opens a new one.
db.$client.on("error", (error) => {
	logger.error(error, { ctx: "database-pool" });
});
