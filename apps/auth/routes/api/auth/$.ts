import { auth } from "@repo/auth";
import { createFileRoute } from "@tanstack/react-router";

const handle = ({ request }: { request: Request }) => auth.handler(request);

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: handle,
			POST: handle,
			PUT: handle,
			PATCH: handle,
			DELETE: handle,
			OPTIONS: handle,
		},
	},
});
