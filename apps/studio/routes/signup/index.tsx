import { SignupForm } from "@auth/components/SignupForm";
import { getEnabledOAuthProviders } from "@auth/lib/enabled-oauth-providers";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signup/")({
	loader: async () => ({
		oAuthProviders: unwrapServerFnResult(await getEnabledOAuthProviders()),
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

function unwrapServerFnResult<T>(value: T | { result: T }): T {
	return value && typeof value === "object" && "result" in value && Object.keys(value).length === 1
		? value.result
		: (value as T);
}
