import path from "node:path";
import { fileURLToPath } from "node:url";

import { hashPassword } from "better-auth/crypto";
import { Client } from "pg";

const authDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../.auth");

export const e2eUsers = {
	admin: {
		id: "e2e-admin",
		email: "e2e-admin@example.com",
		name: "E2E Admin",
		password: "e2e-admin-password-1234",
		role: "admin",
		statePath: path.join(authDir, "admin.json"),
	},
	member: {
		id: "e2e-member",
		email: "e2e-member@example.com",
		name: "E2E Member",
		password: "e2e-member-password-1234",
		role: "user",
		statePath: path.join(authDir, "member.json"),
	},
} as const;

/**
 * Creates the two accounts the authenticated specs sign in with, straight in
 * the database: the app under test is the only thing that should run app code.
 * Re-running keeps the rows; the password never changes, so the stored hash
 * stays valid, and only the role is re-asserted.
 */
export async function seedE2EUsers() {
	const client = new Client({
		connectionString:
			process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/vesact",
	});
	await client.connect();

	try {
		for (const { id, email, name, password, role } of Object.values(e2eUsers)) {
			await client.query(
				`insert into "user" (id, name, email, "emailVerified", role, "onboardingComplete", "createdAt", "updatedAt")
				 values ($1, $2, $3, true, $4, true, now(), now())
				 on conflict (email) do update set role = excluded.role`,
				[id, name, email, role],
			);
			await client.query(
				`insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
				 select $1, u.id, 'credential', u.id, $2, now(), now()
				 from "user" u
				 where u.email = $3
				   and not exists (select 1 from account a where a."userId" = u.id and a."providerId" = 'credential')`,
				[`${id}-credential`, await hashPassword(password), email],
			);
		}
	} finally {
		await client.end();
	}
}
