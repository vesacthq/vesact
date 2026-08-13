import { ChangelogSection } from "@changelog/components/ChangelogSection";
import { SectionHeader } from "@home/components/SectionHeader";
import { createTranslatorForLocale } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

export const Route = createFileRoute("/changelog/")({
	component: ChangelogPage,
	head: () => {
		const t = createTranslatorForLocale(getCurrentLocale(), "marketing");
		return {
			meta: [{ title: t("changelog.title") }],
		};
	},
});

function ChangelogPage() {
	const t = useTranslations("changelog");

	return (
		<div className="py-20 md:py-24 lg:py-28 lg:pb-40">
			<div className="container">
				<SectionHeader
					titleAs="h1"
					eyebrow={t("badge")}
					title={t("title")}
					description={t("description")}
				/>

				<ChangelogSection />
			</div>
		</div>
	);
}
