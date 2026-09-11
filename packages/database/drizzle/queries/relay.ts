import { inArray } from "drizzle-orm";

import { db } from "../client";
import { apikey, relayApiUsage } from "../schema/relay";

export type RelayApiUsageInsert = typeof relayApiUsage.$inferInsert;

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
