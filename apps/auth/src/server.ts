import { createLocaleCookieHeader, handleLocaleMiddleware } from "@repo/i18n/server";
import type { Register } from "@tanstack/react-router";
import {
	createStartHandler,
	defaultStreamHandler,
	type RequestOptions,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

const handler = createStartHandler(defaultStreamHandler);

export default createServerEntry({
	async fetch(req: Request, opts?: RequestOptions<Register>) {
		const { redirect, setCookie } = handleLocaleMiddleware(req);

		if (redirect) {
			return redirect;
		}

		const response = await handler(req, opts);

		if (setCookie) {
			response.headers.append("Set-Cookie", createLocaleCookieHeader(setCookie.value));
		}

		return response;
	},
});
