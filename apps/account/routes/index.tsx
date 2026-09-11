import { sessionQueryOptions } from "@auth/lib/api";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context: { queryClient } }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());
		throw redirect({ href: session ? "/account" : "/login" });
	},
});
