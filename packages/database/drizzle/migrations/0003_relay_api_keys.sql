CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"configId" text DEFAULT 'default' NOT NULL,
	"name" text,
	"start" text,
	"referenceId" text NOT NULL,
	"prefix" text,
	"key" text NOT NULL,
	"refillInterval" integer,
	"refillAmount" integer,
	"lastRefillAt" timestamp,
	"enabled" boolean DEFAULT true,
	"rateLimitEnabled" boolean DEFAULT true,
	"rateLimitTimeWindow" integer DEFAULT 60000,
	"rateLimitMax" integer DEFAULT 300,
	"requestCount" integer DEFAULT 0,
	"remaining" integer,
	"lastRequest" timestamp,
	"expiresAt" timestamp,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "relay_api_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"apiKeyId" text NOT NULL,
	"organizationId" text NOT NULL,
	"method" text NOT NULL,
	"path" text NOT NULL,
	"status" integer NOT NULL,
	"durationMs" integer NOT NULL,
	"requestId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relay_idempotency_key" (
	"apiKeyId" text NOT NULL,
	"routeKey" text NOT NULL,
	"key" text NOT NULL,
	"requestHash" text NOT NULL,
	"state" text NOT NULL,
	"responseStatus" integer,
	"responseBody" text,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "relay_idempotency_key_apiKeyId_routeKey_key_pk" PRIMARY KEY("apiKeyId","routeKey","key")
);
--> statement-breakpoint
CREATE TABLE "relay_inbound_event" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"bodySha256" text NOT NULL,
	"signatureValid" boolean NOT NULL,
	"payload" jsonb NOT NULL,
	"receivedAt" timestamp DEFAULT now() NOT NULL,
	"processedAt" timestamp
);
--> statement-breakpoint
CREATE INDEX "apikey_configId_idx" ON "apikey" USING btree ("configId");--> statement-breakpoint
CREATE INDEX "apikey_referenceId_idx" ON "apikey" USING btree ("referenceId");--> statement-breakpoint
CREATE INDEX "apikey_key_idx" ON "apikey" USING btree ("key");--> statement-breakpoint
CREATE INDEX "relay_api_usage_organization_createdAt_idx" ON "relay_api_usage" USING btree ("organizationId","createdAt");--> statement-breakpoint
CREATE INDEX "relay_api_usage_apiKey_createdAt_idx" ON "relay_api_usage" USING btree ("apiKeyId","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "relay_inbound_event_bodySha256_uidx" ON "relay_inbound_event" USING btree ("bodySha256");