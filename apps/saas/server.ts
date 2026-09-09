import type { Register } from "@tanstack/react-router";
import type { RequestOptions } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";

let server: (typeof import("./src/server"))["default"] | undefined;

const base = import.meta.env.BASE_URL;
const mounted = base !== "/";

// The app is mounted under `base`, but route guards redirect with raw hrefs
// (`redirect({ href: "/login" })`), which are relative to the origin rather than
// to the app. Without this they would leave the app entirely.
function withBase(response: Response) {
	const location = response.headers.get("location");

	if (!location?.startsWith("/") || location.startsWith("//") || location.startsWith(base)) {
		return response;
	}

	const rebased = new Response(response.body, response);
	rebased.headers.set("location", `${base}${location.slice(1)}`);
	return rebased;
}

export default {
	async fetch(request: Request, options?: RequestOptions<Register>) {
		const url = new URL(request.url);
		if (mounted && url.pathname === base.slice(0, -1)) {
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

		const response = await server.fetch(request, options);

		return mounted ? withBase(response) : response;
	},
};
