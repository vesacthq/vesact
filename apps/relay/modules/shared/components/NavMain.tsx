import { useTranslations } from "@i18n/intl";
import { cn } from "@repo/ui";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@repo/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { type AppNavChild, type AppNavItem, useAppNav } from "../hooks/use-app-nav";

type ParentNavItem = AppNavItem & { children: AppNavChild[] };

function navLink(item: { href: string; external?: boolean }) {
	return item.external ? (
		(props: React.ComponentProps<"a">) => (
			<a {...props} href={item.href}>
				{props.children}
			</a>
		)
	) : (
		<Link to={item.href} preload="intent" />
	);
}

function CollapsedNavItem({ item }: { item: ParentNavItem }) {
	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<SidebarMenuButton
							tooltip={item.label}
							isActive={item.isActive}
							aria-label={item.label}
						/>
					}
				>
					<item.icon />
					<span>{item.label}</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-48">
					<DropdownMenuGroup>
						<DropdownMenuLabel>{item.label}</DropdownMenuLabel>
						{item.children.map((child) => (
							<DropdownMenuItem key={child.href} nativeButton={false} render={navLink(child)}>
								{child.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}

function ExpandedNavItem({
	item,
	open,
	onToggle,
}: {
	item: ParentNavItem;
	open: boolean;
	onToggle: () => void;
}) {
	const subMenuId = `subnav-${item.href}`;

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				tooltip={item.label}
				isActive={item.isActive}
				onClick={onToggle}
				aria-expanded={open}
				aria-controls={subMenuId}
			>
				<item.icon />
				<span>{item.label}</span>
				<ChevronRightIcon
					className={cn(
						"size-4 ml-auto shrink-0 opacity-60 transition-transform duration-200",
						open && "rotate-90",
					)}
					aria-hidden="true"
				/>
			</SidebarMenuButton>
			{open && (
				<SidebarMenuSub id={subMenuId}>
					{item.children.map((child) => (
						<SidebarMenuSubItem key={child.href}>
							<SidebarMenuSubButton isActive={child.isActive} render={navLink(child)}>
								<span>{child.label}</span>
							</SidebarMenuSubButton>
						</SidebarMenuSubItem>
					))}
				</SidebarMenuSub>
			)}
		</SidebarMenuItem>
	);
}

function CollapsibleNavItem({ item }: { item: ParentNavItem }) {
	const { state } = useSidebar();
	const [open, setOpen] = useState(() => item.children.some((child) => child.isActive));

	return state === "collapsed" ? (
		<CollapsedNavItem item={item} />
	) : (
		<ExpandedNavItem item={item} open={open} onToggle={() => setOpen((prev) => !prev)} />
	);
}

function LeafNavItem({ item }: { item: AppNavItem }) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton tooltip={item.label} isActive={item.isActive} render={navLink(item)}>
				<item.icon />
				<span>{item.label}</span>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

export function NavMain() {
	const t = useTranslations();
	const { items } = useAppNav();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{t("app.menu.navigationTitle")}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) =>
						item.children ? (
							<CollapsibleNavItem key={item.href} item={item as ParentNavItem} />
						) : (
							<LeafNavItem key={item.href} item={item} />
						),
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
