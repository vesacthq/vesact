import { accountCenterUrl } from "@auth/lib/account-urls";
import { sessionQueryOptions } from "@auth/lib/api";
import { useTranslations } from "@i18n/intl";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { setActiveOrganization } from "@organizations/lib/api";
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
import { useQueryClient } from "@tanstack/react-query";
import { useRouteContext, useRouter, useRouterState } from "@tanstack/react-router";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import { OrganizationLogo } from "./OrganizationLogo";

export function OrganizationSelect() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { isMobile } = useSidebar();
	const currentHref = useRouterState({ select: (state) => state.location.href });
	const organizations = useRouteContext({
		from: "/_authenticated",
		select: (context) => context.organizations,
	});
	const activeOrganization = useActiveOrganization();

	const selectOrganization = async (organizationSlug: string) => {
		const organization = await setActiveOrganization(organizationSlug);

		queryClient.setQueryData(sessionQueryOptions().queryKey, (current) =>
			current && organization
				? { ...current, session: { ...current.session, activeOrganizationId: organization.id } }
				: current,
		);
		void router.navigate({ to: "/$organizationSlug", params: { organizationSlug }, replace: true });
	};

	const activeName =
		activeOrganization?.name ?? t("organizations.organizationSelect.organizations");

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								tooltip={activeName}
								className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
							/>
						}
					>
						<OrganizationLogo
							name={activeName}
							logoUrl={activeOrganization?.logo}
							className="rounded-lg"
						/>
						<div className="text-sm leading-tight grid flex-1 text-left">
							<span className="font-medium truncate">{activeName}</span>
						</div>
						<ChevronsUpDownIcon aria-hidden="true" className="ml-auto" />
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-fit"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								{t("organizations.organizationSelect.organizations")}
							</DropdownMenuLabel>
							{organizations.map((organization) => (
								<DropdownMenuItem
									key={organization.slug}
									onClick={() => selectOrganization(organization.slug)}
									className="gap-2 p-2"
								>
									<OrganizationLogo
										name={organization.name}
										logoUrl={organization.logo}
										className="size-6 rounded-md"
									/>
									{organization.name}
									{activeOrganization?.id === organization.id && (
										<CheckIcon aria-hidden="true" className="ml-auto" />
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								nativeButton={false}
								className="gap-2 p-2"
								render={(props) => (
									<a {...props} href={accountCenterUrl("/orgs/new", currentHref)}>
										<div className="size-6 flex items-center justify-center rounded-md border bg-transparent">
											<PlusIcon aria-hidden="true" className="size-4" />
										</div>
										<div className="font-medium text-muted-foreground">
											{t("organizations.organizationSelect.createNewOrganization")}
										</div>
									</a>
								)}
							/>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
