import { SectionHeader } from "@home/components/SectionHeader";
import { useTranslations } from "use-intl";

const steps = ["connect", "call", "receive"] as const;

export function HowItWorksSection() {
	const t = useTranslations("home.how");

	return (
		<section id="how" className="scroll-mt-20 py-20 lg:py-28 border-t border-border/60">
			<div className="container">
				<SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

				<ol className="gap-10 md:grid-cols-3 grid grid-cols-1">
					{steps.map((step, index) => (
						<li key={step}>
							<p className="font-medium text-sm text-primary tabular-nums">
								{String(index + 1).padStart(2, "0")}
							</p>
							<h3 className="mt-3 font-medium text-lg text-foreground">
								{t(`steps.${step}.title`)}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-foreground/60">
								{t(`steps.${step}.description`)}
							</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
