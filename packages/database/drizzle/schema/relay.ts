import { createId as cuid } from "@paralleldrive/cuid2";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

// Owned by @better-auth/api-key; the columns follow its schema. Keys belong to
// an organization (`referenceId`), the plugin keeps the counters up to date.
export const apikey = pgTable(
	"apikey",
	{
		id: text("id")
			.$defaultFn(() => cuid())
			.primaryKey(),
		configId: text("configId").default("default").notNull(),
		name: text("name"),
		start: text("start"),
		referenceId: text("referenceId").notNull(),
		prefix: text("prefix"),
		key: text("key").notNull(),
		refillInterval: integer("refillInterval"),
		refillAmount: integer("refillAmount"),
		lastRefillAt: timestamp("lastRefillAt"),
		enabled: boolean("enabled").default(true),
		rateLimitEnabled: boolean("rateLimitEnabled").default(true),
		rateLimitTimeWindow: integer("rateLimitTimeWindow").default(60_000),
		rateLimitMax: integer("rateLimitMax").default(300),
		requestCount: integer("requestCount").default(0),
		remaining: integer("remaining"),
		lastRequest: timestamp("lastRequest"),
		expiresAt: timestamp("expiresAt"),
		createdAt: timestamp("createdAt").notNull(),
		updatedAt: timestamp("updatedAt").notNull(),
		permissions: text("permissions"),
		metadata: text("metadata"),
	},
	(table) => [
		index("apikey_configId_idx").on(table.configId),
		index("apikey_referenceId_idx").on(table.referenceId),
		index("apikey_key_idx").on(table.key),
	],
);

export const relayApiUsage = pgTable(
	"relay_api_usage",
	{
		id: text("id")
			.$defaultFn(() => cuid())
			.primaryKey(),
		apiKeyId: text("apiKeyId").notNull(),
		organizationId: text("organizationId").notNull(),
		method: text("method").notNull(),
		path: text("path").notNull(),
		status: integer("status").notNull(),
		durationMs: integer("durationMs").notNull(),
		requestId: text("requestId").notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
	},
	(table) => [
		index("relay_api_usage_organization_createdAt_idx").on(table.organizationId, table.createdAt),
		index("relay_api_usage_apiKey_createdAt_idx").on(table.apiKeyId, table.createdAt),
	],
);

export const relayIdempotencyKey = pgTable(
	"relay_idempotency_key",
	{
		apiKeyId: text("apiKeyId").notNull(),
		routeKey: text("routeKey").notNull(),
		key: text("key").notNull(),
		requestHash: text("requestHash").notNull(),
		state: text("state", { enum: ["in_flight", "completed"] }).notNull(),
		responseStatus: integer("responseStatus"),
		responseBody: text("responseBody"),
		expiresAt: timestamp("expiresAt").notNull(),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.apiKeyId, table.routeKey, table.key] })],
);

export const relayInboundEvent = pgTable(
	"relay_inbound_event",
	{
		id: text("id")
			.$defaultFn(() => cuid())
			.primaryKey(),
		platform: text("platform").notNull(),
		bodySha256: text("bodySha256").notNull(),
		signatureValid: boolean("signatureValid").notNull(),
		payload: jsonb("payload").notNull(),
		receivedAt: timestamp("receivedAt").defaultNow().notNull(),
		processedAt: timestamp("processedAt"),
	},
	(table) => [uniqueIndex("relay_inbound_event_bodySha256_uidx").on(table.bodySha256)],
);
