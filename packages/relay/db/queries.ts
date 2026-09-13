import { and, eq, inArray, lte } from "drizzle-orm";

import { db } from "./client";
import { apikey, relayApiUsage, relayIdempotencyKey, relayInboundEvent } from "./schema";

export type RelayApiUsageInsert = typeof relayApiUsage.$inferInsert;
export type RelayInboundEventInsert = typeof relayInboundEvent.$inferInsert;

export async function recordRelayApiUsage(usage: RelayApiUsageInsert) {
	await db.insert(relayApiUsage).values(usage);
}

export async function listRelayApiUsageByKey(apiKeyId: string, limit = 20) {
	return db.query.relayApiUsage.findMany({
		where: (usage, { eq }) => eq(usage.apiKeyId, apiKeyId),
		orderBy: (usage, { desc }) => desc(usage.createdAt),
		limit,
	});
}

export async function deleteApiKeysByIds(ids: string[]) {
	if (ids.length === 0) {
		return;
	}

	await db.delete(apikey).where(inArray(apikey.id, ids));
}

/** A body that was already received is ignored: platforms retry deliveries. */
export async function recordRelayInboundEvent(event: RelayInboundEventInsert) {
	await db
		.insert(relayInboundEvent)
		.values(event)
		.onConflictDoNothing({ target: relayInboundEvent.bodySha256 });
}

export async function findRelayInboundEventBySha256(bodySha256: string) {
	return db.query.relayInboundEvent.findFirst({
		where: (event, { eq }) => eq(event.bodySha256, bodySha256),
	});
}

export async function deleteRelayInboundEventsByIds(ids: string[]) {
	if (ids.length === 0) {
		return;
	}

	await db.delete(relayInboundEvent).where(inArray(relayInboundEvent.id, ids));
}

export interface IdempotencyScope {
	apiKeyId: string;
	routeKey: string;
	key: string;
}

function inScope(scope: IdempotencyScope) {
	return and(
		eq(relayIdempotencyKey.apiKeyId, scope.apiKeyId),
		eq(relayIdempotencyKey.routeKey, scope.routeKey),
		eq(relayIdempotencyKey.key, scope.key),
	);
}

/**
 * Takes the key for one request: inserts the in-flight row, or replaces one
 * whose lock or stored response has expired. False when another request
 * holds it, which the caller resolves by reading the row.
 */
export async function claimIdempotencyKey(
	scope: IdempotencyScope,
	requestHash: string,
	lockUntil: Date,
): Promise<boolean> {
	const now = new Date();
	const claimed = await db
		.insert(relayIdempotencyKey)
		.values({ ...scope, requestHash, state: "in_flight", expiresAt: lockUntil })
		.onConflictDoUpdate({
			target: [relayIdempotencyKey.apiKeyId, relayIdempotencyKey.routeKey, relayIdempotencyKey.key],
			set: {
				requestHash,
				state: "in_flight",
				responseStatus: null,
				responseBody: null,
				expiresAt: lockUntil,
				createdAt: now,
			},
			setWhere: lte(relayIdempotencyKey.expiresAt, now),
		})
		.returning({ key: relayIdempotencyKey.key });

	return claimed.length > 0;
}

export async function findIdempotencyKey(scope: IdempotencyScope) {
	const row = await db.query.relayIdempotencyKey.findFirst({ where: inScope(scope) });

	if (!row) {
		return null;
	}

	return row.state === "completed" && row.responseStatus !== null && row.responseBody !== null
		? {
				state: "completed" as const,
				requestHash: row.requestHash,
				responseStatus: row.responseStatus,
				responseBody: row.responseBody,
			}
		: { state: "in_flight" as const, requestHash: row.requestHash };
}

export async function completeIdempotencyKey(
	scope: IdempotencyScope,
	response: { responseStatus: number; responseBody: string; expiresAt: Date },
) {
	await db
		.update(relayIdempotencyKey)
		.set({ state: "completed", ...response })
		.where(inScope(scope));
}
