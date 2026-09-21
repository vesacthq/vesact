import { SectionHeader } from "@home/components/SectionHeader";
import { BracesIcon, KeyRoundIcon, PlugZapIcon, WebhookIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useTranslations } from "use-intl";

const items: {
	key: "channels" | "api" | "webhooks" | "keys";
	icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
	{ key: "channels", icon: PlugZapIcon },
	{ key: "api", icon: BracesIcon },
	{ key: "webhooks", icon: WebhookIcon },
	{ key: "keys", icon: KeyRoundIcon },
];

export function FeaturesSection() {
	const t = useTranslations("home.features");

	return (
		<section id="features" className="scroll-mt-20 py-20 lg:py-28 border-t border-border/60">
			<div className="container">
				<SectionHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

				<div className="gap-x-10 gap-y-12 sm:grid-cols-2 grid grid-cols-1">
					{items.map(({ key, icon: Icon }) => (
						<div key={key} className="gap-4 flex">
							<div className="size-10 flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Icon className="size-5" aria-hidden="true" />
							</div>
							<div>
								<h3 className="font-medium text-lg text-foreground">{t(`items.${key}.title`)}</h3>
								<p className="mt-2 text-sm leading-relaxed text-foreground/60">
									{t(`items.${key}.description`)}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
