import { createHash, createHmac } from "node:crypto";
import { parseArgs } from "node:util";

import { deleteRelayInboundEventsByIds, findRelayInboundEventBySha256 } from "@repo/database";
import { logger } from "@repo/logs";
import { nanoid } from "nanoid";

import { accessHeaders, createChecks } from "./lib/acceptance";

/**
 * Runs the acceptance list of issue #37 against a deployed Relay API. Needs
 * META_APP_SECRET and META_WEBHOOK_VERIFY_TOKEN of that environment
 * (`secrets/relay.<target>.env`), DATABASE_URL of the same environment and,
 * on preview, CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET.
 *
 *   sops exec-env secrets/relay.preview.env "sops exec-env secrets/database.preview.env \
 *     'pnpm --filter @repo/scripts relay:webhook-acceptance --url https://api.preview.vesact.com'"
 */
const { values } = parseArgs({
	options: {
		url: { type: "string" },
	},
});

const appSecret = process.env.META_APP_SECRET;
const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

if (!values.url || !appSecret || !verifyToken) {
	logger.error(
		"Usage: relay:webhook-acceptance --url <api url>, with META_APP_SECRET and META_WEBHOOK_VERIFY_TOKEN set",
	);
	process.exit(2);
}

const endpoint = `${values.url.replace(/\/$/, "")}/webhooks/meta`;
const { check, report } = createChecks();

function sign(body: string) {
	return `sha256=${createHmac("sha256", appSecret as string)
		.update(body)
		.digest("hex")}`;
}

function sha256(body: string) {
	return createHash("sha256").update(body).digest("hex");
}

function handshake(token: string) {
	const query = new URLSearchParams({
		"hub.mode": "subscribe",
		"hub.verify_token": token,
		"hub.challenge": "1158201444",
	});
	return fetch(`${endpoint}?${query}`, { headers: accessHeaders() });
}

function deliver(body: string, signature: string) {
	return fetch(endpoint, {
		method: "POST",
		headers: {
			...accessHeaders(),
			"Content-Type": "application/json",
			"X-Hub-Signature-256": signature,
		},
		body,
	});
}

async function main() {
	const event = JSON.stringify({
		object: "page",
		entry: [{ id: `acceptance-${nanoid(8)}`, time: Date.now(), messaging: [] }],
	});
	const tampered = event.replace('"object":"page"', '"object":"pages"');
	const stored: string[] = [];

	try {
		await check("handshake with the verify token → 200 and the challenge", async () => {
			const response = await handshake(verifyToken as string);
			if (response.status !== 200) {
				return `got ${response.status}`;
			}
			const body = await response.text();
			return body === "1158201444" || `body was ${body}`;
		});

		await check("handshake with a wrong token → 403", async () => {
			const response = await handshake("guess");
			return response.status === 403 || `got ${response.status}`;
		});

		await check("signed POST → 200 and one relay_inbound_event row", async () => {
			const response = await deliver(event, sign(event));
			if (response.status !== 200) {
				return `got ${response.status} ${await response.text()}`;
			}
			const row = await findRelayInboundEventBySha256(sha256(event));
			if (!row) {
				return "no row with the body's sha256";
			}
			stored.push(row.id);
			return row.platform === "meta" || `platform was ${row.platform}`;
		});

		await check("the same body again → 200 and still the same row", async () => {
			const response = await deliver(event, sign(event));
			if (response.status !== 200) {
				return `got ${response.status} ${await response.text()}`;
			}
			const row = await findRelayInboundEventBySha256(sha256(event));
			return row?.id === stored[0] || `row is now ${row?.id}`;
		});

		await check("one changed byte under the old signature → 401 and no row", async () => {
			const response = await deliver(tampered, sign(event));
			if (response.status !== 401) {
				return `got ${response.status}`;
			}
			const row = await findRelayInboundEventBySha256(sha256(tampered));
			if (row) {
				stored.push(row.id);
				return "the tampered body was stored";
			}
			return true;
		});

		await check("no signature header → 401", async () => {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { ...accessHeaders(), "Content-Type": "application/json" },
				body: event,
			});
			return response.status === 401 || `got ${response.status}`;
		});
	} finally {
		await deleteRelayInboundEventsByIds(stored);
	}

	report();
}

main().catch((error) => {
	logger.error(error);
	process.exit(1);
});
