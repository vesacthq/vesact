import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/settings/")({
	component: () => <Navigate to="/settings/general" replace />,
});
