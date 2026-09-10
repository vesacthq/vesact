import { SignupForm } from "@auth/components/SignupForm";
import { getEnabledOAuthProviders } from "@auth/lib/enabled-oauth-providers";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signup/")({
	loader: async () => ({
		oAuthProviders: (await getEnabledOAuthProviders()).result,
	}),
	component: SignupPage,
	head: () => ({
		meta: [{ title: documentTitle("Sign up") }],
	}),
});

function SignupPage() {
	const { oAuthProviders } = Route.useLoaderData();

	return (
		<AuthWrapper>
			<SignupForm oAuthProviders={oAuthProviders} />
		</AuthWrapper>
	);
}
