import { ContactForm } from "@home/components/ContactForm";
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
		<div className="max-w-xl py-16 container">
			<div className="mb-12 pt-8 text-center">
				<h1 className="mb-2 font-bold text-5xl">{t("title")}</h1>
				<p className="text-lg text-balance opacity-50">{t("description")}</p>
			</div>

			<ContactForm />
		</div>
	);
}
