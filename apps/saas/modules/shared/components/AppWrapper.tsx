import { cn } from "@repo/ui";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Separator } from "@repo/ui/components/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { Fragment, type PropsWithChildren } from "react";

import { useAppNav } from "../hooks/use-app-nav";
import { AppSidebar } from "./AppSidebar";
import { NotificationCenter } from "./NotificationCenter";

function AppHeader() {
	const { trail } = useAppNav();

	return (
		<header className="h-16 gap-2 px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex shrink-0 items-center transition-[width,height] ease-linear">
			<SidebarTrigger className="-ml-1" />
			<Separator
				orientation="vertical"
				className="mr-2 data-vertical:h-4 data-vertical:self-auto"
			/>
			<Breadcrumb>
				<BreadcrumbList>
					{trail.map((crumb, index) => {
						const isLast = index === trail.length - 1;
						return (
							<Fragment key={`${index}-${crumb.href}`}>
								{index > 0 && <BreadcrumbSeparator className="md:block hidden" />}
								<BreadcrumbItem className={cn(!isLast && "md:block hidden")}>
									{isLast ? (
										<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
									) : (
										<BreadcrumbLink render={<Link to={crumb.href} />}>{crumb.label}</BreadcrumbLink>
									)}
								</BreadcrumbItem>
							</Fragment>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
			<NotificationCenter className="ml-auto" />
		</header>
	);
}

export function AppWrapper({
	children,
	defaultSidebarOpen,
}: PropsWithChildren<{ defaultSidebarOpen?: boolean }>) {
	return (
		<SidebarProvider defaultOpen={defaultSidebarOpen}>
			<AppSidebar />
			<SidebarInset>
				<AppHeader />
				<div className="pb-4 container flex flex-1 flex-col">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
