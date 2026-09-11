import { accountCenterUrl } from "@auth/lib/account-urls";
import { config } from "@config";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useTranslations } from "use-intl";

const authenticatedRoute = getRouteApi("/_authenticated");

export const Route = createFileRoute("/_authenticated/")({
	head: () => ({ meta: [{ title: documentTitle() }] }),
	component: Home,
});

function Home() {
	const { session } = authenticatedRoute.useLoaderData();
	const t = useTranslations("home");

	return (
		<main className="py-20 gap-4 container flex flex-col">
			<h1 className="text-2xl font-semibold">{config.appName}</h1>
			<p className="text-sm text-muted-foreground">
				{t("signedInAs", { email: session.user.email })}
			</p>
			<a href={accountCenterUrl("/", "/")} className="text-sm text-primary">
				{t("accountCenter")}
			</a>
		</main>
	);
}
