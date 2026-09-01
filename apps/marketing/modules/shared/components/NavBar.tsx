import { config } from "@config";
import { LocaleLink, useLocalePathname } from "@i18n/routing";
import { cn, ColorModeToggle, Logo } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui/components/sheet";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { MenuIcon } from "lucide-react";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { useTranslations } from "use-intl";

export function NavBar() {
	const t = useTranslations();
	const localePathname = useLocalePathname();
	const saasUrl = config.saasUrl;

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isTop, setIsTop] = useState(true);

	const handleMobileMenuClose = () => {
		setMobileMenuOpen(false);
	};

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | undefined;

		const onScroll = () => {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(() => {
				setIsTop(window.scrollY <= 10);
			}, 150);
		};

		window.addEventListener("scroll", onScroll);
		setIsTop(window.scrollY <= 10);

		return () => {
			window.removeEventListener("scroll", onScroll);
			if (timeout) {
				clearTimeout(timeout);
			}
		};
	}, []);

	useEffect(() => {
		handleMobileMenuClose();
	}, [localePathname]);

	const menuItems: {
		label: string;
		href: string;
	}[] = [
		{
			label: t("common.menu.pricing"),
			href: "/#pricing",
		},
		{
			label: t("common.menu.faq"),
			href: "/#faq",
		},
		{
			label: t("common.menu.blog"),
			href: "/blog",
		},
		{
			label: t("common.menu.changelog"),
			href: "/changelog",
		},
		{
			label: t("common.menu.contact"),
			href: "/contact",
		},
		...(config.docsUrl
			? [
					{
						label: t("common.menu.docs"),
						href: config.docsUrl,
					},
				]
			: []),
	];

	const isMenuItemActive = (href: string) => localePathname.startsWith(href);

	return (
		<nav
			className={cn(
				"top-0 sticky z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300",
				isTop
					? "border-b border-transparent bg-transparent"
					: "backdrop-blur-xl border-b border-border/60 bg-background/80",
			)}
			data-test="navigation"
		>
			<div className="container">
				<div className="gap-6 h-16 md:h-[4.25rem] flex items-center justify-stretch">
					<div className="flex flex-1 justify-start">
						<LocaleLink href="/" className="block hover:no-underline active:no-underline">
							<Logo className="font-heading" />
						</LocaleLink>
					</div>

					<div className="lg:flex hidden flex-1 items-center justify-center">
						{menuItems.map((menuItem) => (
							<LocaleLink
								key={menuItem.href}
								href={menuItem.href}
								className={cn(
									"px-3 py-2 font-medium text-sm block shrink-0 transition-colors",
									isMenuItemActive(menuItem.href)
										? "text-foreground"
										: "text-foreground/55 hover:text-primary",
								)}
							>
								{menuItem.label}
							</LocaleLink>
						))}
					</div>

					<div className="gap-2 md:gap-3 flex flex-1 items-center justify-end">
						<ColorModeToggle
							labels={{
								system: t("common.colorMode.system"),
								light: t("common.colorMode.light"),
								dark: t("common.colorMode.dark"),
							}}
						/>
						<LocaleSwitch />

						<Sheet open={mobileMenuOpen} onOpenChange={(open) => setMobileMenuOpen(open)}>
							<SheetTrigger
								render={
									<Button
										className="lg:hidden"
										size="icon"
										variant="ghost"
										aria-label={t("common.aria.menu")}
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
												"px-3 py-2 font-medium text-base block shrink-0",
												isMenuItemActive(menuItem.href) ? "text-foreground" : "text-foreground/60",
											)}
										>
											{menuItem.label}
										</LocaleLink>
									))}

									{config.saasUrl && (
										<a
											href={config.saasUrl}
											className="px-3 py-2 text-base block text-primary"
											onClick={handleMobileMenuClose}
										>
											{t("common.menu.login")}
										</a>
									)}
								</div>
							</SheetContent>
						</Sheet>

						{saasUrl && (
							<Button
								className="lg:flex hidden border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
								variant="outline"
								render={(props) => {
									const { children: linkChildren, ...rest } = props;
									return (
										<a href={saasUrl} {...(rest as unknown as ComponentPropsWithoutRef<"a">)}>
											{linkChildren}
										</a>
									);
								}}
							>
								{t("common.menu.login")}
							</Button>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
