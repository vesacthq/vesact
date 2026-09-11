import { recordRelayInboundEvent } from "@repo/database";
import { logger } from "@repo/logs";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

import { sha256Hex } from "../../lib/digest";

type Env = { Variables: { requestId: string } };

const encoder = new TextEncoder();

function parseSignature(header: string | undefined): Uint8Array<ArrayBuffer> | undefined {
	const digest = /^sha256=([0-9a-f]{64})$/i.exec(header ?? "")?.[1];

	if (!digest) {
		return undefined;
	}

	const bytes = new Uint8Array(digest.length / 2);
	for (let index = 0; index < bytes.length; index++) {
		bytes[index] = Number.parseInt(digest.slice(index * 2, index * 2 + 2), 16);
	}

	return bytes;
}

/**
 * Meta signs the raw body with the app secret. Verifying inside Web Crypto
 * keeps the comparison constant-time.
 */
async function verifyMetaSignature(
	secret: string,
	body: ArrayBuffer,
	header: string | undefined,
): Promise<boolean> {
	const signature = parseSignature(header);

	if (!signature) {
		return false;
	}

	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["verify"],
	);

	return crypto.subtle.verify("HMAC", key, signature, body);
}

function required(name: "META_APP_SECRET" | "META_WEBHOOK_VERIFY_TOKEN"): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is not set`);
	}

	return value;
}

export const metaWebhook = new Hono<Env>()
	.get("/", (c) => {
		const query = c.req.query();
		const subscribed =
			query["hub.mode"] === "subscribe" &&
			query["hub.verify_token"] === required("META_WEBHOOK_VERIFY_TOKEN");

		return subscribed ? c.text(query["hub.challenge"] ?? "") : c.text("Forbidden", 403);
	})
	.post("/", bodyLimit({ maxSize: 5 * 1024 * 1024 }), async (c) => {
		const body = await c.req.arrayBuffer();
		const signed = await verifyMetaSignature(
			required("META_APP_SECRET"),
			body,
			c.req.header("X-Hub-Signature-256"),
		);

		if (!signed) {
			logger.warn("Meta webhook signature rejected", { requestId: c.get("requestId") });
			return c.text("Invalid signature", 401);
		}

		let payload: unknown;
		try {
			payload = JSON.parse(new TextDecoder().decode(body));
		} catch {
			return c.text("Body is not JSON", 400);
		}

		await recordRelayInboundEvent({
			platform: "meta",
			bodySha256: await sha256Hex(body),
			payload,
		});

		return c.body(null, 200);
	});
