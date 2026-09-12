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

// These pages moved to the account center; links that predate the move still work.
const legacyAuthPath =
	/^(?:\/[a-z]{2})?\/(?:login|signup|forgot-password|reset-password|verify|onboarding|admin)(?:\/|$)/;

export default createServerEntry({
	async fetch(req: Request, opts?: RequestOptions<Register>) {
		const url = new URL(req.url);

		if (legacyAuthPath.test(url.pathname)) {
			return Response.redirect(new URL(`${url.pathname}${url.search}`, accountUrl).toString(), 302);
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
