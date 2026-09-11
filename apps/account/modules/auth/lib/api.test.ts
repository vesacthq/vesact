import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("./auth-server.server", () => server);
vi.mock("@repo/auth/client", () => ({ authClient: {} }));
// Without the Start compiler a server function is its handler.
vi.mock("@tanstack/react-start", () => {
	const builder = {
		validator: () => builder,
		handler: (handler: (input: { data: unknown }) => unknown) => (options?: { data?: unknown }) =>
			handler({ data: options?.data }),
	};
	return { createServerFn: () => builder };
});

import { refreshSession, sessionQueryKey, sessionQueryOptions } from "./api";

describe("refreshSession", () => {
	it("replaces a cached anonymous session with nothing observing it", async () => {
		const queryClient = new QueryClient();
		const session = { session: { id: "session-1" }, user: { id: "user-1" } };
		queryClient.setQueryData(sessionQueryKey, null);
		server.getSession.mockResolvedValue(session);

		await expect(queryClient.ensureQueryData(sessionQueryOptions())).resolves.toBeNull();
		expect(server.getSession).not.toHaveBeenCalled();

		await refreshSession(queryClient);

		expect(server.getSession).toHaveBeenCalledTimes(1);
		await expect(queryClient.ensureQueryData(sessionQueryOptions())).resolves.toEqual(session);
		expect(server.getSession).toHaveBeenCalledTimes(1);
	});
});
