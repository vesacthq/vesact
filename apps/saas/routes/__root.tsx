import { SessionProvider } from "@auth/components/SessionProvider";
import { config } from "@config";
import { I18nProvider } from "@i18n/provider";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { Button, cn, ThemeProvider, Toaster } from "@repo/ui";
// Button is used by the error boundary to render a "Try again" action.
import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { ClientProviders } from "@shared/components/ClientProviders";
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
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import appCss from "./globals.css?url";

export const Route = createRootRoute({
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
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..700;1,300..700&display=swap",
			},
		],
	}),
	component: RootLayout,
	errorComponent: ({ error }) => <RootError error={error} />,
	notFoundComponent: () => <RootNotFound />,
});

function RootLayout() {
	useRouterState({ select: (s) => s.location.pathname });
	const locale = getCurrentLocale();

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className={cn("min-h-screen bg-background text-foreground antialiased")}>
				<NuqsAdapter>
					<ThemeProvider defaultTheme={config.defaultTheme}>
						<ApiClientProvider>
							<SessionProvider>
								<ClientProviders>
									<I18nProvider>
										<Outlet />
										<Toaster position="top-right" />
									</I18nProvider>
								</ClientProviders>
							</SessionProvider>
						</ApiClientProvider>
					</ThemeProvider>
				</NuqsAdapter>
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
			<p className="text-sm text-muted-foreground">An unexpected error occurred.</p>
			<ErrorComponent error={error} />
			<div className="gap-2 flex">
				<Button variant="secondary" onClick={() => router.invalidate()}>
					Try again
				</Button>
				<Link
					to="/"
					className="h-9 px-4 font-medium text-sm flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-[var(--button-hover-primary)]"
				>
					Back to home
				</Link>
			</div>
		</div>
	);
}

function RootNotFound() {
	return (
		<div className="max-w-xl px-6 py-20 gap-4 mx-auto flex min-h-[60vh] flex-col items-center justify-center text-center">
			<h1 className="text-4xl font-bold">404</h1>
			<p className="text-sm text-muted-foreground">
				We couldn&apos;t find the page you were looking for.
			</p>
			<Link
				to="/"
				className="h-9 px-4 font-medium text-sm flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-[var(--button-hover-primary)]"
			>
				Back to home
			</Link>
		</div>
	);
}
