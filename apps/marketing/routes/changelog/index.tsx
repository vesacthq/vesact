import { ChangelogSection } from "@changelog/components/ChangelogSection";
import { createTranslatorForLocale } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

export const Route = createFileRoute("/changelog/")({
	component: ChangelogPage,
	head: () => {
		const t = createTranslatorForLocale(getCurrentLocale(), "marketing");
		return {
			meta: [{ title: documentTitle(t("changelog.title")) }],
		};
	},
});

function ChangelogPage() {
	const t = useTranslations("changelog");

	return (
		<div className="max-w-3xl py-16 container">
			<div className="mb-12 pt-8 text-center text-balance">
				<h1 className="mb-2 font-bold text-5xl">{t("title")}</h1>
				<p className="text-lg opacity-50">{t("description")}</p>
			</div>

			<ChangelogSection />
		</div>
	);
}
