import { SignupForm } from "@auth/components/SignupForm";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signup/")({
	component: SignupPage,
	head: () => ({
		meta: [{ title: documentTitle("Sign up") }],
	}),
});

function SignupPage() {
	return (
		<AuthWrapper>
			<SignupForm />
		</AuthWrapper>
	);
}
