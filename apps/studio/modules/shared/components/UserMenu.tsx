import { useSession } from "@auth/hooks/use-session";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { ColorModeToggle } from "@repo/ui";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@repo/ui/components/sidebar";
import { UserAvatar } from "@shared/components/UserAvatar";
import { Link } from "@tanstack/react-router";
import { BookIcon, ChevronsUpDownIcon, HomeIcon, LogOutIcon, SettingsIcon } from "lucide-react";

export function UserMenu() {
	const t = useTranslations();
	const { user } = useSession();
	const { isMobile } = useSidebar();

	const onLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: async () => {
					window.location.href = new URL(
						config.redirectAfterLogout,
						window.location.origin,
					).toString();
				},
			},
		});
	};

	if (!user) {
		return null;
	}

	const { name, email, image } = user;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								tooltip={name ?? ""}
								className="aria-expanded:bg-muted"
							/>
						}
					>
						<UserAvatar name={name ?? ""} avatarUrl={image} />
						<div className="text-sm leading-tight grid flex-1 text-left">
							<span className="font-medium truncate">{name}</span>
							<span className="text-xs truncate">{email}</span>
						</div>
						<ChevronsUpDownIcon aria-hidden="true" className="size-4 ml-auto" />
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-fit"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="gap-2 px-1 py-1.5 text-sm flex items-center text-left">
									<UserAvatar name={name ?? ""} avatarUrl={image} />
									<div className="text-sm leading-tight grid flex-1 text-left">
										<span className="font-medium truncate">{name}</span>
										<span className="text-xs truncate">{email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem nativeButton={false} render={<Link to="/settings/general" />}>
								<SettingsIcon aria-hidden="true" />
								{t("app.userMenu.accountSettings")}
							</DropdownMenuItem>
							{config.docsUrl && (
								<DropdownMenuItem
									nativeButton={false}
									render={(props) => (
										<a {...props} href={config.docsUrl}>
											<BookIcon aria-hidden="true" />
											{t("app.userMenu.documentation")}
										</a>
									)}
								/>
							)}
							{config.marketingUrl && (
								<DropdownMenuItem
									nativeButton={false}
									render={(props) => (
										<a {...props} href={config.marketingUrl}>
											<HomeIcon aria-hidden="true" />
											{t("app.userMenu.home")}
										</a>
									)}
								/>
							)}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<div className="gap-4 px-2 py-1.5 text-sm flex items-center justify-between">
							<span>{t("app.userMenu.colorMode")}</span>
							<ColorModeToggle
								modes={["system", "light", "dark"]}
								labels={{
									system: t("common.colorMode.system"),
									light: t("common.colorMode.light"),
									dark: t("common.colorMode.dark"),
								}}
							/>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onLogout}>
							<LogOutIcon aria-hidden="true" />
							{t("app.userMenu.logout")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
