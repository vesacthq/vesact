import { LoginForm } from "@auth/components/LoginForm";
import { getSession } from "@auth/lib/auth-server.server";
import { getSafeRedirectPath } from "@auth/lib/redirects";
import { config } from "@config";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

interface LoginSearch extends Record<string, string | undefined> {
	redirectTo?: string;
}

const loadSessionForLoginRouteFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => {
		return { result: await getSession() };
	},
);

type LoginRouteSession = Awaited<ReturnType<typeof getSession>>;

export const Route = createFileRoute("/login/")({
	validateSearch: (search): LoginSearch => ({
		redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
	}),
	loaderDeps: ({ search }) => ({
		redirectTo: search.redirectTo,
	}),
	loader: async ({ deps }) => {
		const session = unwrapServerFnResult<LoginRouteSession>(await loadSessionForLoginRouteFn());

		if (session) {
			throw redirect({
				href: getSafeRedirectPath(deps.redirectTo, config.redirectAfterSignIn),
			});
		}
	},
	component: LoginPage,
	head: () => ({
		meta: [{ title: documentTitle("Login") }],
	}),
});

function LoginPage() {
	return (
		<AuthWrapper>
			<LoginForm />
		</AuthWrapper>
	);
}

function unwrapServerFnResult<T>(value: T | { result: T }): T {
	return value && typeof value === "object" && "result" in value && Object.keys(value).length === 1
		? value.result
		: (value as T);
}
