import { config } from "@config";
import { SectionHeader } from "@home/components/SectionHeader";
import { LocaleLink } from "@i18n/routing";
import { Button } from "@repo/ui/components/button";
import { ArrowRightIcon } from "lucide-react";
import { useMemo, type ComponentPropsWithoutRef } from "react";
import { useTranslations } from "use-intl";

export function CtaSection() {
	const t = useTranslations();

	const signupUrl = useMemo(
		() => config.saasUrl && `${String(config.saasUrl).replace(/\/$/, "")}/signup`,
		[],
	);

	return (
		<section id="cta" className="scroll-mt-20 py-24 lg:py-36 border-t border-border/60">
			<div className="container">
				<SectionHeader
					align="center"
					className="mb-0 lg:mb-0"
					eyebrow={t("home.cta.badge")}
					title={t("home.cta.title")}
					description={t("home.cta.description")}
				/>

				<div className="mt-10 gap-3 flex flex-wrap items-center justify-center">
					{signupUrl && (
						<Button
							size="lg"
							variant="primary"
							render={(props) => {
								const { children: linkChildren, ...rest } = props;
								return (
									<a href={signupUrl} {...(rest as unknown as ComponentPropsWithoutRef<"a">)}>
										{linkChildren}
									</a>
								);
							}}
						>
							{t("home.cta.primary")}
							<ArrowRightIcon className="ml-2 size-4" />
						</Button>
					)}
					<Button
						size="lg"
						variant="ghost"
						className="text-touch hover:bg-touch/10 hover:text-touch"
						render={(props) => <LocaleLink {...props} href="/contact" />}
					>
						{t("home.cta.secondary")}
					</Button>
				</div>
			</div>
		</section>
	);
}
