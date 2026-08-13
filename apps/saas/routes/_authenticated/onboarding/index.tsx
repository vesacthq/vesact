import { OnboardingForm } from "@onboarding/components/OnboardingForm";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/")({
	component: OnboardingPage,
	head: () => ({
		meta: [{ title: documentTitle("Onboarding") }],
	}),
});

function OnboardingPage() {
	return (
		<AuthWrapper>
			<OnboardingForm />
		</AuthWrapper>
	);
}
