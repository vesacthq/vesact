import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./db/schema.ts",
	out: "./db/migrations",
	dbCredentials: {
		url: process.env.RELAY_DATABASE_URL as string,
	},
});
