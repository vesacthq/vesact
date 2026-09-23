import { CtaSection } from "@home/components/CtaSection";
import { FeaturesSection } from "@home/components/FeaturesSection";
import { HeroSection } from "@home/components/HeroSection";
import { HowItWorksSection } from "@home/components/HowItWorksSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<>
			<HeroSection />
			<FeaturesSection />
			<HowItWorksSection />
			<CtaSection />
		</>
	);
}
