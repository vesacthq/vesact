import { GoogleSigninButton } from "@auth/components/GoogleSigninButton";
import { sessionQueryOptions } from "@auth/lib/api";
import { getSafeRedirectPath } from "@auth/lib/redirects";
import { useTranslations } from "@i18n/intl";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";

interface LoginSearch {
	redirectTo?: string;
}

export const Route = createFileRoute("/login/")({
	validateSearch: (search): LoginSearch => ({
		redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : undefined,
	}),
	beforeLoad: async ({ context: { queryClient }, search }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());

		if (session) {
			throw redirect({ href: getSafeRedirectPath(search.redirectTo) });
		}
	},
	component: LoginPage,
	head: () => ({ meta: [{ title: documentTitle("Login") }] }),
});

function LoginPage() {
	const t = useTranslations();
	const { redirectTo } = Route.useSearch();

	return (
		<AuthWrapper>
			<div className="gap-6 flex flex-col">
				<div>
					<h1 className="text-2xl font-semibold">{t("auth.login.title")}</h1>
					<p className="mt-1 text-muted-foreground">{t("auth.login.subtitle")}</p>
				</div>
				<GoogleSigninButton callbackURL={getSafeRedirectPath(redirectTo)} />
			</div>
		</AuthWrapper>
	);
}
