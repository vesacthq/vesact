// The leaf module: the api barrel would pull the database client in before
// connectDatabase() has run.
import { notFoundResponse } from "@repo/relay/api/errors";
import { getBaseUrl } from "@repo/utils";
import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import type { ExecutionContext } from "hono";

import { dispatch } from "./dispatch";

let api: (typeof import("./src/api"))["api"] | undefined;
let server: (typeof import("./src/server"))["default"] | undefined;

const hosts = {
	consoleHost: new URL(getBaseUrl(import.meta.env.VITE_RELAY_URL, 3005)).host,
	apiHost: new URL(getBaseUrl(import.meta.env.VITE_RELAY_API_URL, 3005)).host,
};

// Hyperdrive only hands out its connection string inside a request, and
// @repo/relay/db reads RELAY_DATABASE_URL as its module body runs. Loading the
// app on the first request puts that read after the binding is available.
function connectDatabase() {
	if (env.HYPERDRIVE) {
		process.env.RELAY_DATABASE_URL = env.HYPERDRIVE.connectionString;
	}
}

export default {
	async fetch(request: Request, options?: RequestOptions<Register>, ctx?: ExecutionContext) {
		const url = new URL(request.url);
		const target = dispatch(url, hosts);

		if (target === "not-found") {
			return notFoundResponse(request.method, url.pathname);
		}

		if (target === "api") {
			if (!api) {
				connectDatabase();
				api = (await import("./src/api")).api;
			}

			return api.fetch(request, options, ctx);
		}

		if (!server) {
			connectDatabase();
			server = (await import("./src/server")).default;
		}

		return server.fetch(request, options);
	},
};
