import { LoginForm } from "@auth/components/LoginForm";
import { getSession } from "@auth/lib/auth-server.server";
import { getEnabledOAuthProviders } from "@auth/lib/enabled-oauth-providers";
import { getSafeRedirectUrl, invitationUrl } from "@auth/lib/redirects";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

interface LoginSearch extends Record<string, string | undefined> {
	redirectTo?: string;
	invitationId?: string;
	email?: string;
}

const loadSessionForLoginRouteFn = createServerFn({ method: "GET", strict: false }).handler(
	async () => ({ result: await getSession() }),
);

export const Route = createFileRoute("/login/")({
	validateSearch: (search): LoginSearch => ({
		redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
		invitationId: typeof search.invitationId === "string" ? search.invitationId : undefined,
		email: typeof search.email === "string" ? search.email : undefined,
	}),
	loaderDeps: ({ search }) => ({
		redirectTo: search.redirectTo,
		invitationId: search.invitationId,
	}),
	loader: async ({ deps }) => {
		const session = (await loadSessionForLoginRouteFn()).result;

		if (session) {
			throw redirect({
				href: deps.invitationId
					? invitationUrl(deps.invitationId)
					: getSafeRedirectUrl(deps.redirectTo),
			});
		}

		return { oAuthProviders: (await getEnabledOAuthProviders()).result };
	},
	component: LoginPage,
	head: () => ({
		meta: [{ title: documentTitle("Login") }],
	}),
});

function LoginPage() {
	const { oAuthProviders } = Route.useLoaderData();

	return (
		<AuthWrapper>
			<LoginForm oAuthProviders={oAuthProviders} />
		</AuthWrapper>
	);
}
