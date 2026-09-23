import { config } from "@config";
import { LocaleLink } from "@i18n/routing";
import { Logo } from "@repo/ui";
import { useTranslations } from "use-intl";

const linkClassName = "block transition-colors hover:text-primary";

export function Footer() {
	const t = useTranslations("common.footer");

	return (
		<footer className="py-16 lg:py-20 text-sm border-t border-border/60 text-foreground/45">
			<div className="gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] sm:gap-10 container grid grid-cols-1 items-start">
				<div>
					<Logo className="opacity-70" />
					<p className="mt-4 max-w-xs text-sm leading-relaxed">
						© {new Date().getFullYear()} {config.appName}.
					</p>
					<p className="mt-1 max-w-xs text-sm leading-relaxed">
						{t("operatedBy", { company: config.companyName })}
					</p>
				</div>

				<div className="gap-2.5 flex flex-col">
					<LocaleLink href="/#features" className={linkClassName}>
						{t("product")}
					</LocaleLink>
					<LocaleLink href="/#how" className={linkClassName}>
						{t("howItWorks")}
					</LocaleLink>
					<LocaleLink href="/contact" className={linkClassName}>
						{t("contact")}
					</LocaleLink>
					{config.consoleUrl && (
						<a href={config.consoleUrl} className={linkClassName}>
							{t("console")}
						</a>
					)}
				</div>

				<div className="gap-2.5 flex flex-col">
					<LocaleLink href="/legal/privacy-policy" className={linkClassName}>
						{t("privacyPolicy")}
					</LocaleLink>
					<LocaleLink href="/legal/terms" className={linkClassName}>
						{t("terms")}
					</LocaleLink>
					<LocaleLink href="/legal/data-deletion" className={linkClassName}>
						{t("dataDeletion")}
					</LocaleLink>
				</div>
			</div>
		</footer>
	);
}
