import { config } from "@config";
import { HeroWireframe } from "@home/components/HeroWireframe";
import { Button } from "@repo/ui/components/button";
import { ArrowRightIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useTranslations } from "use-intl";

export function HeroSection() {
	const t = useTranslations();

	return (
		<section className="max-w-full">
			<div className="pt-20 pb-10 md:pt-24 md:pb-12 lg:pt-28 lg:pb-14 container overflow-x-hidden">
				<div className="max-w-5xl">
					<p className="mb-6 gap-2.5 font-medium text-sm tracking-wide flex flex-wrap items-center text-foreground/50">
						<span className="px-2 py-0.5 font-semibold tracking-wide text-xs rounded-full bg-primary text-primary-foreground">
							{t("home.hero.new")}
						</span>
						{t("home.hero.featureBadge")}
					</p>

					<h1 className="font-medium text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-(--leading-hero) text-balance text-foreground">
						{t("home.hero.title")}
					</h1>

					<p className="mt-6 text-base sm:text-lg max-w-xl leading-relaxed text-pretty text-foreground/55">
						{t("home.hero.subtitle")}
					</p>

					<div className="mt-8 gap-3 flex flex-wrap items-center">
						<Button
							size="lg"
							variant="default"
							nativeButton={false}
							render={(props) => {
								const { children: linkChildren, ...rest } = props;
								return (
									<a href={config.saasUrl} {...(rest as unknown as ComponentPropsWithoutRef<"a">)}>
										{linkChildren}
									</a>
								);
							}}
						>
							{t("home.hero.getStarted")}
							<ArrowRightIcon className="ml-2 size-4" />
						</Button>
						{config.docsUrl && (
							<Button
								variant="ghost"
								size="lg"
								className="text-primary hover:bg-primary/10 hover:text-primary"
								nativeButton={false}
								render={(props) => {
									const { children: linkChildren, ...rest } = props;
									return (
										<a
											href={config.docsUrl}
											{...(rest as unknown as ComponentPropsWithoutRef<"a">)}
										>
											{linkChildren}
										</a>
									);
								}}
							>
								{t("home.hero.documentation")}
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="pb-16 md:pb-20 lg:pb-24 container">
				<HeroWireframe />
			</div>
		</section>
	);
}
