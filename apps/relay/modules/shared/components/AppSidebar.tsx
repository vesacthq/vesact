import { OrganizationSelect } from "@organizations/components/OrganizationSelect";
import { Logo } from "@repo/ui";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@repo/ui/components/sidebar";

import { NavMain } from "./NavMain";
import { UserMenu } from "./UserMenu";

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<Logo label="Relay" className="px-2 py-1 text-sm group-data-[collapsible=icon]:hidden" />
				<OrganizationSelect />
			</SidebarHeader>
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
