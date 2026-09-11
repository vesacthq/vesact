import { relayApp } from "@repo/api/modules/relay/app";
import { notFoundResponse } from "@repo/api/modules/relay/lib/errors";
import { Hono } from "hono";

export const api = new Hono()
	.route("/", relayApp)
	.notFound((c) => notFoundResponse(c.req.method, c.req.path));
