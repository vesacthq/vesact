import { basePath } from "@repo/utils";
import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

let server: (typeof import("./src/server"))["default"] | undefined;

// Static files live at the root of the assets directory while the app is
// mounted on a path; the assets binding is asked for the file under its own name.
const staticFile = /\.[a-z0-9]+$/i;

export default {
	async fetch(request: Request, options?: RequestOptions<Register>) {
		const url = new URL(request.url);

		if (
			basePath &&
			env.ASSETS &&
			url.pathname.startsWith(`${basePath}/`) &&
			staticFile.test(url.pathname)
		) {
			url.pathname = url.pathname.slice(basePath.length);
			const asset = await env.ASSETS.fetch(new Request(url, request));

			if (asset.status !== 404) {
				return asset;
			}
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
