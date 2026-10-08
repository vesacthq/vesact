import { config } from "@config";
import { SectionHeader } from "@home/components/SectionHeader";
import { LocaleLink } from "@i18n/routing";
import { Button } from "@repo/ui/components/button";
import { ExternalLinkButton } from "@shared/components/ExternalLinkButton";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "use-intl";

export function CtaSection() {
	const t = useTranslations("home.cta");

	return (
		<section id="cta" className="scroll-mt-20 py-24 lg:py-36 border-t border-border/60">
			<div className="container">
				<SectionHeader
					align="center"
					className="mb-0 lg:mb-0"
					eyebrow={t("eyebrow")}
					title={t("title")}
					description={t("description")}
				/>

				<div className="mt-10 gap-3 flex flex-wrap items-center justify-center">
					{config.consoleUrl && (
						<ExternalLinkButton size="lg" href={config.consoleUrl}>
							{t("primary")}
							<ArrowRightIcon className="ml-2 size-4" />
						</ExternalLinkButton>
					)}
					<Button
						size="lg"
						variant="ghost"
						className="text-primary hover:bg-primary/10 hover:text-primary"
						nativeButton={false}
						render={(props) => <LocaleLink {...props} href="/contact" />}
					>
						{t("secondary")}
					</Button>
				</div>
			</div>
		</section>
	);
}
