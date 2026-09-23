import { LocaleLink } from "@i18n/routing";
import { Button } from "@repo/ui";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslations } from "use-intl";

export function NotFoundPage() {
	const t = useTranslations("notFound");

	return (
		<div className="px-6 flex min-h-[60vh] flex-col items-center justify-center text-center">
			<p className="font-medium text-sm tracking-wide text-foreground/45">{t("code")}</p>
			<h1 className="mt-2 font-medium text-3xl md:text-4xl tracking-tight text-balance">
				{t("title")}
			</h1>

			<Button
				className="mt-6"
				variant="secondary"
				nativeButton={false}
				render={(props) => <LocaleLink {...props} href="/" />}
			>
				<ArrowLeftIcon className="mr-2 size-4" /> {t("goToHomepage")}
			</Button>
		</div>
	);
}
