import { config } from "@config";
import { Button } from "@repo/ui/components/button";
import { ArrowRightIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useTranslations } from "use-intl";

export function HeroSection() {
	const t = useTranslations("home.hero");
	const imageAlt = t("imageAlt");

	return (
		<div className="relative max-w-full overflow-x-hidden">
			<div className="py-8 md:py-16 relative z-20 container text-center">
				<div className="mb-4 flex justify-center">
					<div className="px-3 py-1 font-normal text-sm flex flex-wrap items-center justify-center rounded-full bg-muted p-px text-foreground">
						<span className="gap-2 font-semibold flex items-center rounded-full">{t("new")}</span>
						<span className="ml-1 font-medium block">{t("featureBadge")}</span>
					</div>
				</div>

				<h1 className="font-medium text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tighter max-w-4xl mx-auto text-balance text-foreground">
					{t("title")}
				</h1>

				<p className="mt-2 text-sm sm:text-lg max-w-4xl mx-auto text-balance text-foreground/60">
					{t("subtitle")}
				</p>

				<div className="mt-4 gap-2 flex items-center justify-center">
					<Button
						size="lg"
						variant="primary"
						render={(props) => {
							const { children: linkChildren, ...rest } = props;
							return (
								<a href={config.saasUrl} {...(rest as unknown as ComponentPropsWithoutRef<"a">)}>
									{linkChildren}
								</a>
							);
						}}
					>
						{t("getStarted")}
						<ArrowRightIcon className="ml-2 size-4" />
					</Button>
					{config.docsUrl && (
						<Button
							variant="ghost"
							size="lg"
							render={(props) => {
								const { children: linkChildren, ...rest } = props;
								return (
									<a href={config.docsUrl} {...(rest as unknown as ComponentPropsWithoutRef<"a">)}>
										{linkChildren}
									</a>
								);
							}}
						>
							{t("documentation")}
						</Button>
					)}
				</div>

				<div className="mt-12 lg:mt-16 lg:flex-1 p-4 mx-auto rounded-4xl bg-muted">
					<img
						src="/images/hero-image.png"
						alt={imageAlt}
						className="block h-auto w-full rounded-xl dark:hidden"
						width={1200}
						height={630}
						fetchPriority="high"
					/>
					<img
						src="/images/hero-image-dark.png"
						alt={imageAlt}
						className="hidden h-auto w-full rounded-xl dark:block"
						width={1200}
						height={630}
						fetchPriority="high"
					/>
				</div>
			</div>
		</div>
	);
}
