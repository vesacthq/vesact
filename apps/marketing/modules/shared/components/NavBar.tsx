import { config } from "@config";
import { LocaleLink, useLocalePathname } from "@i18n/routing";
import { cn, Logo } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui/components/sheet";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { MenuIcon } from "lucide-react";
import {
	Suspense,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ComponentPropsWithoutRef,
} from "react";
import { useTranslations } from "use-intl";

/** Tiny trailing-edge debounce scoped to this module; avoids an extra dep. */
function useDebouncedCallback<Args extends unknown[]>(
	callback: (...args: Args) => void,
	delayMs: number,
) {
	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	return useCallback(
		(...args: Args) => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
			timerRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delayMs);
		},
		[delayMs],
	);
}

export function NavBar() {
	const localePathname = useLocalePathname();
	const t = useTranslations("common");

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isTop, setIsTop] = useState(true);

	const handleMobileMenuClose = () => {
		setMobileMenuOpen(false);
	};

	const debouncedScrollHandler = useDebouncedCallback(() => {
		setIsTop(window.scrollY <= 10);
	}, 150);

	useEffect(() => {
		window.addEventListener("scroll", debouncedScrollHandler);
		debouncedScrollHandler();
		return () => {
			window.removeEventListener("scroll", debouncedScrollHandler);
		};
	}, [debouncedScrollHandler]);

	useEffect(() => {
		handleMobileMenuClose();
	}, [localePathname]);

	const menuItems: {
		label: string;
		href: string;
	}[] = [
		{
			label: t("menu.pricing"),
			href: "/#pricing",
		},
		{
			label: t("menu.faq"),
			href: "/#faq",
		},
		{
			label: t("menu.blog"),
			href: "/blog",
		},
		{
			label: t("menu.changelog"),
			href: "/changelog",
		},
		{
			label: t("menu.contact"),
			href: "/contact",
		},
		...(config.docsUrl
			? [
					{
						label: t("menu.docs"),
						href: config.docsUrl,
					},
				]
			: []),
	];

	const isMenuItemActive = (href: string) => localePathname.startsWith(href);

	return (
		<nav
			className={cn("top-0 sticky z-50 w-full bg-background transition-shadow duration-200", {
				"border-b": !isTop,
			})}
			data-test="navigation"
		>
			<div className="container">
				<div
					className={cn(
						"gap-6 flex items-center justify-stretch transition-[padding] duration-200",
						!isTop ? "py-4" : "py-6",
					)}
				>
					<div className="flex flex-1 justify-start">
						<LocaleLink href="/" className="block hover:no-underline active:no-underline">
							<Logo />
						</LocaleLink>
					</div>

					<div className="lg:flex hidden flex-1 items-center justify-center">
						{menuItems.map((menuItem) => (
							<LocaleLink
								key={menuItem.href}
								href={menuItem.href}
								className={cn(
									"px-3 py-2 font-medium text-sm block shrink-0 text-foreground/80",
									isMenuItemActive(menuItem.href) ? "font-bold text-foreground" : "",
								)}
							>
								{menuItem.label}
							</LocaleLink>
						))}
					</div>

					<div className="gap-3 flex flex-1 items-center justify-end">
						<ColorModeToggle />
						<Suspense>
							<LocaleSwitch />
						</Suspense>

						<Sheet open={mobileMenuOpen} onOpenChange={(open) => setMobileMenuOpen(open)}>
							<SheetTrigger
								render={
									<Button
										className="lg:hidden"
										size="icon"
										variant="secondary"
										aria-label={t("aria.menu")}
									>
										<MenuIcon className="size-4" />
									</Button>
								}
							/>
							<SheetContent className="w-[280px]" side="right">
								<SheetTitle />
								<div className="flex flex-col items-start justify-center">
									{menuItems.map((menuItem) => (
										<LocaleLink
											key={menuItem.href}
											href={menuItem.href}
											onClick={handleMobileMenuClose}
											className={cn(
												"px-3 py-2 font-medium text-base block shrink-0 text-foreground/80",
												isMenuItemActive(menuItem.href) ? "font-bold text-foreground" : "",
											)}
										>
											{menuItem.label}
										</LocaleLink>
									))}

									{config.saasUrl && (
										<a
											href={config.saasUrl}
											className="px-3 py-2 text-base block"
											onClick={handleMobileMenuClose}
										>
											{t("menu.login")}
										</a>
									)}
								</div>
							</SheetContent>
						</Sheet>

						{config.saasUrl && (
							<Button
								className="lg:flex hidden"
								variant="secondary"
								render={(props) => {
									const { children: linkChildren, ...rest } = props;
									return (
										<a
											href={config.saasUrl}
											{...(rest as unknown as ComponentPropsWithoutRef<"a">)}
										>
											{linkChildren}
										</a>
									);
								}}
							>
								{t("menu.login")}
							</Button>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
