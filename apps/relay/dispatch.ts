const apiPrefixes = ["/v1", "/webhooks", "/oauth"];

export type Target = "api" | "console" | "not-found";

export function isApiPath(pathname: string): boolean {
	return apiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * One Worker answers on two hostnames. API paths go to Hono whichever host
 * they arrive on; everything else is the console, except on the API host,
 * which has no pages. Locally both hosts are the same, so that rule is off.
 */
export function dispatch(url: URL, hosts: { consoleHost: string; apiHost: string }): Target {
	if (isApiPath(url.pathname)) {
		return "api";
	}

	if (hosts.apiHost !== hosts.consoleHost && url.host === hosts.apiHost) {
		return "not-found";
	}

	return "console";
}

export function notFound(method: string, pathname: string): Response {
	return Response.json(
		{
			defined: false,
			code: "NOT_FOUND",
			status: 404,
			message: `No route for ${method} ${pathname}`,
		},
		{ status: 404 },
	);
}
