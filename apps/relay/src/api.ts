import { Hono } from "hono";

import { notFound } from "../dispatch";

export const api = new Hono()
	.get("/v1/health", (c) => c.json({ status: "ok" }))
	.notFound((c) => notFound(c.req.method, c.req.path));
