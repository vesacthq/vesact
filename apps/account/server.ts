import { getBaseUrl } from "@repo/utils";
import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

let server: (typeof import("./src/server"))["default"] | undefined;

const accountUrl = getBaseUrl(import.meta.env.VITE_ACCOUNT_URL as string | undefined, 3004);

// The account center used to answer on auth.<domain>; those hostnames stay
// attached to this Worker until 2026-12 so old links and emails keep working.
function isLegacyHost(url: URL) {
	return url.hostname.startsWith("auth.") && url.origin !== new URL(accountUrl).origin;
}

export default {
	async fetch(request: Request, options?: RequestOptions<Register>) {
		const url = new URL(request.url);

		if (isLegacyHost(url)) {
			return Response.redirect(new URL(`${url.pathname}${url.search}`, accountUrl).toString(), 301);
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
