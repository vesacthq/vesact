import { useTranslations } from "@i18n/intl";
import { ColorModeToggle, Logo } from "@repo/ui";
import type { PropsWithChildren } from "react";

export function AuthWrapper({ children }: PropsWithChildren) {
	const t = useTranslations();

	return (
		<div className="py-6 flex min-h-screen w-full">
			<div className="gap-8 flex w-full flex-col items-center">
				<div className="container flex items-center justify-between">
					<Logo withLabel={false} />
					<ColorModeToggle
						modes={["system", "light", "dark"]}
						labels={{
							system: t("common.colorMode.system"),
							light: t("common.colorMode.light"),
							dark: t("common.colorMode.dark"),
						}}
					/>
				</div>
				<div className="container flex flex-1 items-center justify-center">
					<main className="max-w-md w-full">{children}</main>
				</div>
			</div>
		</div>
	);
}
