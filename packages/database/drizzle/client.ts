import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema/postgres";

// Check the drizzle documentation for more information on how to connect to your preferred database provider
// https://orm.drizzle.team/docs/get-started-postgresql

const databaseUrl =
	process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/flint";

export const db = drizzle(databaseUrl, {
	schema,
});
