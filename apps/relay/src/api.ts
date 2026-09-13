import { notFoundResponse, relayApp } from "@repo/relay/api";
import { Hono } from "hono";

export const api = new Hono()
	.route("/", relayApp)
	.notFound((c) => notFoundResponse(c.req.method, c.req.path));
