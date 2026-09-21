import { config } from "@config";
import { SectionHeader } from "@home/components/SectionHeader";
import { LocaleLink } from "@i18n/routing";
import { createTranslatorForLocale } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

export const Route = createFileRoute("/contact/")({
	component: ContactPage,
	head: () => {
		const t = createTranslatorForLocale(getCurrentLocale(), "vesact-www");
		return {
			meta: [{ title: documentTitle(t("contact.title")) }],
		};
	},
});

function ContactPage() {
	const t = useTranslations();

	return (
		<div className="py-20 md:py-24 lg:py-28 lg:pb-40">
			<div className="container">
				<div className="gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20 lg:items-start grid w-full grid-cols-1">
					<SectionHeader
						titleAs="h1"
						className="mb-0 lg:mb-0"
						eyebrow={t("contact.eyebrow")}
						title={t("contact.title")}
						description={t("contact.description")}
					/>

					<dl className="gap-8 text-base grid grid-cols-1">
						<div>
							<dt className="font-medium text-sm text-foreground/50">{t("contact.emailLabel")}</dt>
							<dd className="mt-1">
								<a href={`mailto:${config.contactEmail}`} className="text-primary hover:underline">
									{config.contactEmail}
								</a>
							</dd>
						</div>
						<div>
							<dt className="font-medium text-sm text-foreground/50">
								{t("contact.companyLabel")}
							</dt>
							<dd className="mt-1 text-foreground">{config.companyName}</dd>
						</div>
						<div>
							<dt className="font-medium text-sm text-foreground/50">{t("contact.legalLabel")}</dt>
							<dd className="mt-1 gap-x-4 flex flex-wrap">
								<LocaleLink href="/legal/privacy-policy" className="text-primary hover:underline">
									{t("common.footer.privacyPolicy")}
								</LocaleLink>
								<LocaleLink href="/legal/terms" className="text-primary hover:underline">
									{t("common.footer.terms")}
								</LocaleLink>
								<LocaleLink href="/legal/data-deletion" className="text-primary hover:underline">
									{t("common.footer.dataDeletion")}
								</LocaleLink>
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	);
}
