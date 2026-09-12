import { createLocaleCookieHeader, handleLocaleMiddleware } from "@repo/i18n/server";
import { withEarlyHints } from "@repo/utils";
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

export default createServerEntry({
	async fetch(req: Request, opts?: RequestOptions<Register>) {
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
