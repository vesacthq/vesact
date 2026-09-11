import { onError } from "@orpc/client";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { logger } from "@repo/logs";
import { getBaseUrl } from "@repo/utils";

import { relayRouter } from "./router";

export const relayHandler = new OpenAPIHandler(relayRouter, {
	plugins: [
		new SmartCoercionPlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
			specPath: "/openapi.json",
			docsPath: "/docs",
			docsTitle: "Relay API",
			specGenerateOptions: () => ({
				info: { title: "Relay API", version: "1.0.0" },
				servers: [{ url: `${getBaseUrl(process.env.VITE_RELAY_API_URL, 3005)}/v1` }],
				components: {
					securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
				},
				security: [{ bearerAuth: [] }],
			}),
		}),
	],
	clientInterceptors: [
		onError((error) => {
			logger.error(error);
		}),
	],
});
