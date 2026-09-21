import { config } from "@config";
import { ExternalLinkButton } from "@shared/components/ExternalLinkButton";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "use-intl";

export function HeroSection() {
	const t = useTranslations("home.hero");

	return (
		<section className="max-w-full">
			<div className="pt-20 pb-16 md:pt-24 md:pb-20 lg:pt-28 lg:pb-24 container overflow-x-hidden">
				<div className="max-w-5xl">
					<p className="mb-6 font-medium text-sm tracking-wide text-primary">{t("eyebrow")}</p>

					<h1 className="font-medium text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-(--leading-hero) text-balance text-foreground">
						{t("title")}
					</h1>

					<p className="mt-6 text-base sm:text-lg max-w-2xl leading-relaxed text-pretty text-foreground/55">
						{t("subtitle")}
					</p>

					<div className="mt-8 gap-3 flex flex-wrap items-center">
						{config.consoleUrl && (
							<ExternalLinkButton size="lg" href={config.consoleUrl}>
								{t("getStarted")}
								<ArrowRightIcon className="ml-2 size-4" />
							</ExternalLinkButton>
						)}
						{config.docsUrl && (
							<ExternalLinkButton
								size="lg"
								variant="ghost"
								className="text-primary hover:bg-primary/10 hover:text-primary"
								href={config.docsUrl}
							>
								{t("documentation")}
							</ExternalLinkButton>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
