import { OtpForm } from "@auth/components/OtpForm";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/verify/")({
	component: VerifyPage,
	head: () => ({
		meta: [{ title: documentTitle("Verify") }],
	}),
});

function VerifyPage() {
	return (
		<AuthWrapper>
			<OtpForm />
		</AuthWrapper>
	);
}
