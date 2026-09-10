import { OnboardingForm } from "@onboarding/components/OnboardingForm";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";

interface OnboardingSearch extends Record<string, string | undefined> {
	redirectTo?: string;
	step?: string;
}

export const Route = createFileRoute("/_authenticated/onboarding/")({
	validateSearch: (search): OnboardingSearch => ({
		redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
		step: typeof search.step === "string" ? search.step : undefined,
	}),
	component: OnboardingPage,
	head: () => ({ meta: [{ title: documentTitle("Onboarding") }] }),
});

function OnboardingPage() {
	return (
		<AuthWrapper>
			<OnboardingForm />
		</AuthWrapper>
	);
}
