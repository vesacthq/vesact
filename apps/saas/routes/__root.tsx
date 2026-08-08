import { SessionProvider } from "@auth/components/SessionProvider";
import { config } from "@config";
import { I18nProvider } from "@i18n/provider";
import { getCurrentLocale } from "@repo/i18n/runtime";
import type { PermissionsDefinition } from "@repo/permissions";
import { Button, cn, ThemeProvider, Toaster } from "@repo/ui";
import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { ClientProviders } from "@shared/components/ClientProviders";
import { ConsentBanner } from "@shared/components/ConsentBanner";
import { ConsentProvider } from "@shared/components/ConsentProvider";
import { PermixProvider } from "@shared/components/PermixProvider";
import { getPermixState } from "@shared/lib/get-permix-state";
import {
	createRootRouteWithContext,
	ErrorComponent,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { Permix } from "permix";

import appCss from "./globals.css?url";

export interface RouterContext {
	permix: Permix<PermissionsDefinition>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ context }) => {
		const state = await getPermixState();
		context.permix.hydrate(state);
		return { permixState: state };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "robots",
				content: "noindex, nofollow",
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
	useRouterState({ select: (routerState) => routerState.location.pathname });
	const locale = getCurrentLocale();
	const { permix, permixState } = Route.useRouteContext();

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
								<PermixProvider permix={permix} state={permixState}>
									<ClientProviders>
										<I18nProvider>
											<ConsentProvider>
												<Outlet />
												<ConsentBanner />
												<Toaster position="top-right" />
											</ConsentProvider>
										</I18nProvider>
									</ClientProviders>
								</PermixProvider>
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
