import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

let server: (typeof import("./src/server"))["default"] | undefined;

// Hyperdrive only hands out its connection string inside a request, and
// @repo/database reads DATABASE_URL as its module body runs. Loading the app
// on the first request puts that read after the binding is available.
export default {
	async fetch(request: Request, options?: RequestOptions<Register>) {
		if (!server) {
			if (env.HYPERDRIVE) {
				process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
			}

			server = (await import("./src/server")).default;
		}

		return server.fetch(request, options);
	},
};
