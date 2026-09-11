import { onError } from "@orpc/client";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { logger } from "@repo/logs";

import { relayRouter } from "./router";

export const relayHandler = new OpenAPIHandler(relayRouter, {
	plugins: [
		new SmartCoercionPlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	clientInterceptors: [
		onError((error) => {
			logger.error(error);
		}),
	],
});
