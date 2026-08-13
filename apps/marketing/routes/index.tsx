import { CtaSection } from "@home/components/CtaSection";
import { FaqSection } from "@home/components/FaqSection";
import { FeaturesSection } from "@home/components/FeaturesSection";
import { HeroSection } from "@home/components/HeroSection";
import { NewsletterSection } from "@home/components/NewsletterSection";
import { PricingSection } from "@home/components/PricingSection";
import { TestimonialsSection } from "@home/components/TestimonialsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<>
			<HeroSection />
			<FeaturesSection />
			<TestimonialsSection />
			<PricingSection />
			<FaqSection />
			<CtaSection />
			<NewsletterSection />
		</>
	);
}
