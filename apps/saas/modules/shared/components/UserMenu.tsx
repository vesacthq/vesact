import { useSession } from "@auth/hooks/use-session";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import {
	cn,
	ColorModeToggle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui";
import { UserAvatar } from "@shared/components/UserAvatar";
import { Link } from "@tanstack/react-router";
import { BookIcon, HomeIcon, LogOutIcon, MoreVerticalIcon, SettingsIcon } from "lucide-react";

import { useIsMobile } from "../hooks/use-media-query";

export function UserMenu({ showUserName }: { showUserName?: boolean }) {
	const t = useTranslations();
	const { user } = useSession();
	const isMobile = useIsMobile();

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
	const dropdownSide = isMobile ? "bottom" : showUserName ? "top" : "right";
	const dropdownAlign = isMobile || !showUserName ? "end" : "start";

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				render={(props) => (
					<button
						{...props}
						type="button"
						className={cn(
							props.className,
							"gap-2 md:w-[100%+1rem] md:px-2 md:py-1.5 md:hover:bg-primary/5 flex w-full cursor-pointer items-center justify-between rounded-lg outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
						)}
						aria-label="User menu"
					>
						<span className="gap-2 flex items-center">
							<UserAvatar name={name ?? ""} avatarUrl={image} />
							{showUserName && (
								<span className="leading-tight text-left">
									<span className="font-medium text-sm">{name}</span>
									<span className="text-xs block opacity-70">{email}</span>
								</span>
							)}
						</span>

						{showUserName && <MoreVerticalIcon className="size-4" />}
					</button>
				)}
			/>

			<DropdownMenuContent
				side={dropdownSide}
				align={dropdownAlign}
				className="w-56 min-w-[var(--anchor-width)]"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						{name}
						<span className="font-normal text-xs block opacity-70">{email}</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				{/* Color mode selection: a control row, not a selectable menu item */}
				<div className="gap-4 px-3 py-2 text-sm flex items-center justify-between">
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

				<DropdownMenuItem
					nativeButton={false}
					render={(props) => (
						<Link
							{...props}
							to="/settings/general"
							className={cn(props.className, "flex cursor-default items-center")}
						>
							<SettingsIcon className="size-4" />
							{t("app.userMenu.accountSettings")}
						</Link>
					)}
				/>

				{config.docsUrl && (
					<DropdownMenuItem
						nativeButton={false}
						render={(props) => (
							<a
								{...props}
								href={config.docsUrl}
								className={cn(props.className, "flex cursor-default items-center")}
							>
								<BookIcon className="size-4" />
								{t("app.userMenu.documentation")}
							</a>
						)}
					/>
				)}

				{config.marketingUrl && (
					<DropdownMenuItem
						nativeButton={false}
						render={(props) => (
							<a
								{...props}
								href={config.marketingUrl}
								className={cn(props.className, "flex cursor-default items-center")}
							>
								<HomeIcon className="size-4" />
								{t("app.userMenu.home")}
							</a>
						)}
					/>
				)}

				<DropdownMenuItem onClick={onLogout}>
					<LogOutIcon className="size-4" />
					{t("app.userMenu.logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
