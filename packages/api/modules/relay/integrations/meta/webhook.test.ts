import { createHash, createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: { api: { verifyApiKey: vi.fn() } },
}));

vi.mock("@repo/database", () => ({
	recordRelayApiUsage: vi.fn(async () => {}),
	recordRelayInboundEvent: vi.fn(async () => {}),
}));

vi.mock("@repo/logs", () => ({
	logger: { error: vi.fn(), warn: vi.fn(), log: vi.fn() },
}));

import { recordRelayInboundEvent } from "@repo/database";

import { relayApp } from "../../app";

const secret = "app-secret";
const verifyToken = "verify-token";
const event = JSON.stringify({ object: "page", entry: [{ id: "1", time: 1, messaging: [] }] });

function sign(body: string, key = secret) {
	return `sha256=${createHmac("sha256", key).update(body).digest("hex")}`;
}

function handshake(query: Record<string, string>) {
	return relayApp.request(`/webhooks/meta?${new URLSearchParams(query)}`);
}

function post(body: string, headers: Record<string, string>) {
	return relayApp.request("/webhooks/meta", {
		method: "POST",
		body,
		headers: { "Content-Type": "application/json", ...headers },
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv("META_APP_SECRET", secret);
	vi.stubEnv("META_WEBHOOK_VERIFY_TOKEN", verifyToken);
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("GET /webhooks/meta", () => {
	it("answers the handshake with the challenge", async () => {
		const response = await handshake({
			"hub.mode": "subscribe",
			"hub.verify_token": verifyToken,
			"hub.challenge": "1158201444",
		});
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("1158201444");
		expect(response.headers.get("X-Request-Id")).toMatch(/^req_/);
	});

	it("refuses a wrong verify token", async () => {
		const response = await handshake({
			"hub.mode": "subscribe",
			"hub.verify_token": "guess",
			"hub.challenge": "1158201444",
		});
		expect(response.status).toBe(403);
	});

	it("refuses a mode other than subscribe", async () => {
		const response = await handshake({
			"hub.mode": "unsubscribe",
			"hub.verify_token": verifyToken,
			"hub.challenge": "1158201444",
		});
		expect(response.status).toBe(403);
	});
});

describe("POST /webhooks/meta", () => {
	it("stores a signed body and answers 200", async () => {
		const response = await post(event, { "X-Hub-Signature-256": sign(event) });
		expect(response.status).toBe(200);
		expect(recordRelayInboundEvent).toHaveBeenCalledWith({
			platform: "meta",
			bodySha256: createHash("sha256").update(event).digest("hex"),
			payload: JSON.parse(event),
		});
	});

	it("rejects a signature made with another secret", async () => {
		const response = await post(event, { "X-Hub-Signature-256": sign(event, "other") });
		expect(response.status).toBe(401);
		expect(recordRelayInboundEvent).not.toHaveBeenCalled();
	});

	it("rejects a body that changed after signing", async () => {
		const response = await post(event.replace('"id":"1"', '"id":"2"'), {
			"X-Hub-Signature-256": sign(event),
		});
		expect(response.status).toBe(401);
		expect(recordRelayInboundEvent).not.toHaveBeenCalled();
	});

	it("rejects a missing or malformed signature header", async () => {
		expect((await post(event, {})).status).toBe(401);
		expect((await post(event, { "X-Hub-Signature-256": "sha1=abc" })).status).toBe(401);
		expect(recordRelayInboundEvent).not.toHaveBeenCalled();
	});

	it("rejects a signed body that is not JSON", async () => {
		const response = await post("not json", { "X-Hub-Signature-256": sign("not json") });
		expect(response.status).toBe(400);
		expect(recordRelayInboundEvent).not.toHaveBeenCalled();
	});

	it("rejects a body above 5 MB before verifying it", async () => {
		const body = "x".repeat(5 * 1024 * 1024 + 1);
		const response = await post(body, { "X-Hub-Signature-256": sign(body) });
		expect(response.status).toBe(413);
		expect(recordRelayInboundEvent).not.toHaveBeenCalled();
	});
});
