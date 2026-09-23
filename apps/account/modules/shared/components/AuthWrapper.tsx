import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { cn, ColorModeToggle, Logo } from "@repo/ui";
import type { PropsWithChildren } from "react";

import { LocaleSwitch } from "./LocaleSwitch";

export function AuthWrapper({
	children,
	contentClass,
}: PropsWithChildren<{ contentClass?: string }>) {
	const t = useTranslations();

	return (
		<div className="py-6 flex min-h-screen w-full">
			<div className="gap-8 flex w-full flex-col items-center">
				<div className="container">
					<div className="flex items-center justify-between">
						<a href={config.marketingUrl ?? "/"} className="block">
							<Logo brand="allcast" withLabel={false} />
						</a>

						<div className="gap-2 flex items-center justify-end">
							<LocaleSwitch />
							<ColorModeToggle
								modes={["system", "light", "dark"]}
								labels={{
									system: t("common.colorMode.system"),
									light: t("common.colorMode.light"),
									dark: t("common.colorMode.dark"),
								}}
							/>
						</div>
					</div>
				</div>

				<div className="container flex flex-1 items-center justify-center">
					<main className={cn("max-w-md w-full", contentClass)}>{children}</main>
				</div>

				{config.icpFilingNumber && (
					<footer className="text-xs container text-center text-muted-foreground">
						<a
							href="https://beian.miit.gov.cn/"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors hover:text-foreground"
						>
							{config.icpFilingNumber}
						</a>
					</footer>
				)}
			</div>
		</div>
	);
}
