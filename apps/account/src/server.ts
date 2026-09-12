import { createLocaleCookieHeader, handleLocaleMiddleware } from "@repo/i18n/server";
import { getBaseUrl, withEarlyHints } from "@repo/utils";
import type { Register } from "@tanstack/react-router";
import {
	createStartHandler,
	defaultStreamHandler,
	type RequestOptions,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

const handler = createStartHandler(defaultStreamHandler);

// The Node target runs behind Caddy, which terminates TLS; srvx reads this
// export and takes the protocol and host from the X-Forwarded-* headers.
export const trustProxy = true;

const accountUrl = getBaseUrl(import.meta.env.VITE_ACCOUNT_URL as string | undefined, 3004);

// The account center used to answer on auth.<domain>; those hostnames stay
// attached to this Worker until 2026-12 so old links and emails keep working.
function isLegacyHost(url: URL) {
	return url.hostname.startsWith("auth.") && url.origin !== new URL(accountUrl).origin;
}

export default createServerEntry({
	async fetch(req: Request, opts?: RequestOptions<Register>) {
		const url = new URL(req.url);

		if (isLegacyHost(url)) {
			return Response.redirect(`${accountUrl}${url.pathname}${url.search}`, 301);
		}

		const { redirect, setCookie } = handleLocaleMiddleware(req);

		if (redirect) {
			return redirect;
		}

		const response = await withEarlyHints(await handler(req, opts));

		if (setCookie) {
			response.headers.append("Set-Cookie", createLocaleCookieHeader(setCookie.value));
		}

		return response;
	},
});
