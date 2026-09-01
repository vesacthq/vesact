import { AnalyticsScript } from "@analytics";
import { I18nProvider } from "@i18n/provider";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { ThemeProvider } from "@repo/ui";
import { ConsentBanner } from "@shared/components/ConsentBanner";
import { ConsentProvider } from "@shared/components/ConsentProvider";
import { Footer } from "@shared/components/Footer";
import { NavBar } from "@shared/components/NavBar";
import { NotFoundPage } from "@shared/components/NotFoundPage";
import { documentTitle } from "@shared/lib/document-title";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";

import appCss from "./globals.css?url";

export const Route = createRootRoute({
	notFoundComponent: NotFoundPage,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: documentTitle() },
		],
		links: [
			{
				rel: "icon",
				type: "image/png",
				href: "/icon.png",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100..900&display=swap",
			},
		],
	}),
	component: RootLayout,
});

function RootLayout() {
	useRouterState({ select: (s) => s.location.pathname });
	const lang = getCurrentLocale();

	return (
		<html lang={lang} suppressHydrationWarning>
			<head>
				<HeadContent />
				<AnalyticsScript />
			</head>
			<body className="font-sans min-h-screen bg-background text-foreground antialiased">
				<ThemeProvider>
					<I18nProvider>
						<ConsentProvider>
							{/* Isolate stacking so portaled Base UI popups (menu, select, tooltip) paint above sticky chrome (e.g. z-50 nav). */}
							<div className="isolate min-h-screen">
								<NavBar />
								<Outlet />
								<Footer />
							</div>
							<ConsentBanner />
						</ConsentProvider>
					</I18nProvider>
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}
