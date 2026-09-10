import { getBaseUrl } from "@repo/utils";
import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

let server: (typeof import("./src/server"))["default"] | undefined;

const authUrl = getBaseUrl(import.meta.env.VITE_AUTH_URL as string | undefined, 3004);

// The auth pages moved to the auth app; links that predate the move still work.
const legacyAuthPath =
	/^(?:\/[a-z]{2})?\/(?:login|signup|forgot-password|reset-password|verify)(?:\/|$)/;

export default {
	async fetch(request: Request, options?: RequestOptions<Register>) {
		const url = new URL(request.url);

		if (legacyAuthPath.test(url.pathname)) {
			return Response.redirect(new URL(`${url.pathname}${url.search}`, authUrl).toString(), 302);
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
