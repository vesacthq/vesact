import { config } from "@config";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { useTranslations } from "use-intl";

export function PlaceholderPage() {
	const t = useTranslations("placeholder");

	return (
		<div className="px-6 py-6 flex min-h-screen flex-col">
			<div className="flex justify-end">
				<LocaleSwitch />
			</div>

			<main className="flex flex-1 flex-col items-center justify-center text-center">
				<h1 className="font-medium text-3xl md:text-4xl tracking-tight text-balance">
					{config.placeholderSiteName}
				</h1>
				<p className="mt-4 text-foreground/60">{t("description")}</p>
			</main>

			<footer className="text-sm text-center text-foreground/45">
				<p>
					© {new Date().getFullYear()} {config.placeholderSiteName}
				</p>
				{config.icpFilingNumber && (
					<a
						href="https://beian.miit.gov.cn/"
						target="_blank"
						rel="noopener noreferrer"
						className="mt-1 block transition-colors hover:text-primary"
					>
						{config.icpFilingNumber}
					</a>
				)}
			</footer>
		</div>
	);
}
