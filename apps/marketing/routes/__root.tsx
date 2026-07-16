import { AnalyticsScript } from "@analytics";
import { config } from "@config";
import { I18nProvider } from "@i18n/provider";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { ThemeProvider } from "@repo/ui";
import { Footer } from "@shared/components/Footer";
import { NavBar } from "@shared/components/NavBar";
import { NotFoundPage } from "@shared/components/NotFoundPage";
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
			{ title: config.appName },
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
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..700;1,300..700&display=swap",
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
						{/* Isolate stacking so portaled Base UI popups (menu, select, tooltip) paint above sticky chrome (e.g. z-50 nav). */}
						<div className="isolate min-h-screen">
							<NavBar />
							<Outlet />
							<Footer />
						</div>
					</I18nProvider>
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}
