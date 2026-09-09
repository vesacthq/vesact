import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

let server: (typeof import("./src/server"))["default"] | undefined;

const base = import.meta.env.BASE_URL;

export default {
	async fetch(request: Request, options?: RequestOptions<Register>) {
		const url = new URL(request.url);
		if (base !== "/" && url.pathname === base.slice(0, -1)) {
			url.pathname = base;
			return Response.redirect(url.toString(), 308);
		}

		// Hyperdrive only hands out its connection string inside a request, and
		// @repo/database reads DATABASE_URL as its module body runs. Loading the app
		// on the first request puts that read after the binding is available.
		if (!server) {
			if (env.HYPERDRIVE) {
				process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
			}

			server = (await import("./src/server")).default;
		}

		return server.fetch(request, options);
	},
};
