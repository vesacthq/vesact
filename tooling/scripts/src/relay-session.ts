import { createHmac, randomBytes } from "node:crypto";
import { parseArgs } from "node:util";

import { logger } from "@repo/logs";
import { db, session, user } from "@repo/relay/db";

/**
 * Relay signs in with Google only, so a check or a test that needs a console
 * session gets one written straight into Relay's database, plus the cookie
 * better-auth would have set: `<token>.<base64 HMAC-SHA256(token, secret)>`,
 * URL-encoded, under the `relay` cookie prefix (`__Secure-` in front when
 * VITE_RELAY_URL is https). Needs RELAY_DATABASE_URL, VITE_RELAY_URL and the
 * BETTER_AUTH_SECRET of the same environment.
 *
 *   sops exec-env secrets/relay.dev.env \
 *     'pnpm --filter @repo/scripts relay:session --email you@example.com'
 */
const { values } = parseArgs({
	options: {
		email: { type: "string" },
		name: { type: "string" },
	},
});

const secret = process.env.BETTER_AUTH_SECRET;

if (!values.email || !secret) {
	logger.error("Usage: BETTER_AUTH_SECRET=… relay:session --email <email> [--name <name>]");
	process.exit(2);
}

async function main(email: string, name: string, secret: string) {
	const [account] = await db
		.insert(user)
		.values({ name, email, emailVerified: true })
		.onConflictDoUpdate({ target: user.email, set: { updatedAt: new Date() } })
		.returning({ id: user.id });

	const token = randomBytes(32).toString("base64url");
	await db.insert(session).values({
		token,
		userId: account.id,
		expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		updatedAt: new Date(),
	});

	const signature = createHmac("sha256", secret).update(token).digest("base64");
	// better-auth prefixes the cookie with `__Secure-` wherever the console is served over https.
	const cookieName = process.env.VITE_RELAY_URL?.startsWith("https://")
		? "__Secure-relay.session_token"
		: "relay.session_token";
	logger.info(`${cookieName}=${encodeURIComponent(`${token}.${signature}`)}`);
	await db.$client.end();
}

main(values.email, values.name ?? values.email, secret).catch((error) => {
	logger.error(error);
	process.exit(1);
});
