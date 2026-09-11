import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: ["./drizzle/schema/postgres.ts", "./drizzle/schema/relay.ts"],
	out: "./drizzle/migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
