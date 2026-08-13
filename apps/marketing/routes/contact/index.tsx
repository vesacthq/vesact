import { ContactForm } from "@home/components/ContactForm";
import { SectionHeader } from "@home/components/SectionHeader";
import { createTranslatorForLocale } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

export const Route = createFileRoute("/contact/")({
	component: ContactPage,
	head: () => {
		const t = createTranslatorForLocale(getCurrentLocale(), "marketing");
		return {
			meta: [{ title: documentTitle(t("contact.title")) }],
		};
	},
});

function ContactPage() {
	const t = useTranslations("contact");

	return (
		<div className="py-20 md:py-24 lg:py-28 lg:pb-40">
			<div className="container">
				<div className="gap-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20 lg:items-start grid w-full grid-cols-1">
					<SectionHeader
						titleAs="h1"
						className="mb-0 lg:mb-0"
						eyebrow={t("badge")}
						title={t("title")}
						description={t("description")}
					/>

					<ContactForm />
				</div>
			</div>
		</div>
	);
}
