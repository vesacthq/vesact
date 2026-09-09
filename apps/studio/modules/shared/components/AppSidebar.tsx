import { config } from "@config";
import { OrganizationSelect } from "@organizations/components/OrganizationSelect";
import { config as authConfig } from "@repo/auth/config";
import { Logo } from "@repo/ui";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@repo/ui/components/sidebar";
import { Link } from "@tanstack/react-router";

import { NavMain } from "./NavMain";
import { UserMenu } from "./UserMenu";

function AppLogo() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" tooltip={config.appName} render={<Link to="/" />}>
					<Logo withLabel={false} className="[&_svg]:size-8" />
					<div className="text-sm leading-tight grid flex-1 text-left">
						<span className="font-medium truncate">{config.appName}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

export function AppSidebar() {
	const showOrganizations =
		authConfig.organizations.enable && !authConfig.organizations.hideOrganization;

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>{showOrganizations ? <OrganizationSelect /> : <AppLogo />}</SidebarHeader>
			<SidebarContent>
				<NavMain />
			</SidebarContent>
			<SidebarFooter>
				<UserMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
