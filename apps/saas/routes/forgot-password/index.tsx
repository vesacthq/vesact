import { ForgotPasswordForm } from "@auth/components/ForgotPasswordForm";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password/")({
	component: ForgotPasswordPage,
	head: () => ({
		meta: [{ title: documentTitle("Forgot password") }],
	}),
});

function ForgotPasswordPage() {
	return (
		<AuthWrapper>
			<ForgotPasswordForm />
		</AuthWrapper>
	);
}
