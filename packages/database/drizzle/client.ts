import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema/postgres";

// Check the drizzle documentation for more information on how to connect to your preferred database provider
// https://orm.drizzle.team/docs/get-started-postgresql

const databaseUrl =
	process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/vesact";

// Workers bind a socket to the request that opened it, so a pooled connection
// cannot survive into the next request. Retiring a client after one checkout
// keeps every socket inside one request; Hyperdrive does the real pooling.
export const db = drizzle({
	connection: { connectionString: databaseUrl, maxUses: 1 },
	schema,
});
