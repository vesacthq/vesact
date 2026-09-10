import { SessionProvider } from "@auth/components/SessionProvider";
import { config } from "@config";
import { I18nProvider } from "@i18n/provider";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { Button, cn, ThemeProvider, Toaster } from "@repo/ui";
import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { documentTitle } from "@shared/lib/document-title";
import {
	createRootRoute,
	ErrorComponent,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";

import appCss from "./globals.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "robots", content: "noindex, nofollow" },
			{ title: documentTitle() },
		],
		links: [
			{ rel: "icon", type: "image/png", href: "/icon.png" },
			{ rel: "stylesheet", href: appCss },
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap",
			},
		],
	}),
	component: RootLayout,
	errorComponent: ({ error }) => <RootError error={error} />,
	notFoundComponent: () => <RootNotFound />,
});

function RootLayout() {
	useRouterState({ select: (routerState) => routerState.location.pathname });
	const locale = getCurrentLocale();

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className={cn("font-sans min-h-screen bg-background text-foreground antialiased")}>
				<ThemeProvider defaultTheme={config.defaultTheme}>
					<ApiClientProvider>
						<SessionProvider>
							<I18nProvider>
								<Outlet />
								<Toaster />
							</I18nProvider>
						</SessionProvider>
					</ApiClientProvider>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}

function RootError({ error }: { error: Error }) {
	const router = useRouter();
	return (
		<div className="max-w-xl px-6 py-20 gap-4 mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
			<h1 className="text-2xl font-semibold">Something went wrong</h1>
			<ErrorComponent error={error} />
			<Button variant="secondary" onClick={() => router.invalidate()}>
				Try again
			</Button>
		</div>
	);
}

function RootNotFound() {
	return (
		<div className="max-w-xl px-6 py-20 gap-4 mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
			<h1 className="text-4xl font-bold">404</h1>
			<Link to="/account" className="text-sm text-primary">
				Go to your account
			</Link>
		</div>
	);
}
