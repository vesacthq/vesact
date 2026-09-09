import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

let server: (typeof import("./src/server"))["default"] | undefined;

const appUrl = import.meta.env.VITE_SAAS_URL as string | undefined;
const authUrl = import.meta.env.VITE_AUTH_URL as string | undefined;

// The auth hostname routes to this Worker but is not a second address for the
// app: it answers auth endpoints and sends everything else back to the app.
const authOnlyHostname =
	appUrl && authUrl && new URL(authUrl).hostname !== new URL(appUrl).hostname
		? new URL(authUrl).hostname
		: undefined;

export default {
	async fetch(request: Request, options?: RequestOptions<Register>) {
		const url = new URL(request.url);

		if (appUrl && url.hostname === authOnlyHostname && !url.pathname.startsWith("/api/auth")) {
			return Response.redirect(new URL(`${url.pathname}${url.search}`, appUrl).toString(), 302);
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
