import { inArray } from "drizzle-orm";

import { db } from "../client";
import { apikey, relayApiUsage, relayInboundEvent } from "../schema/relay";

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
