import { useSession } from "@auth/hooks/use-session";
import { useTranslations } from "@i18n/intl";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { useOrganizationListQuery } from "@organizations/lib/api";
import { usePlanData } from "@payments/hooks/plan-data";
import { usePurchases } from "@payments/hooks/purchases";
import { config as authConfig } from "@repo/auth/config";
import { config as paymentsConfig } from "@repo/payments/config";
import { cn } from "@repo/ui";
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
import { Link, useRouter } from "@tanstack/react-router";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, UserIcon } from "lucide-react";

import { OrganizationLogo } from "./OrganizationLogo";

function PersonalAccountIcon({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				"size-8 flex shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground",
				className,
			)}
		>
			<UserIcon className="size-4" />
		</span>
	);
}

function ActiveCheck({ active }: { active: boolean }) {
	return active ? <CheckIcon aria-hidden="true" className="ml-auto" /> : null;
}

export function OrganizationSelect() {
	const t = useTranslations();
	const { user } = useSession();
	const router = useRouter();
	const { isMobile } = useSidebar();
	const { activeOrganization, setActiveOrganization } = useActiveOrganization();
	const { data: allOrganizations } = useOrganizationListQuery();
	const { planData } = usePlanData();
	const { activePlan: orgActivePlan } = usePurchases(activeOrganization?.id);
	const { activePlan: userActivePlan } = usePurchases();

	if (!user) {
		return null;
	}

	const activePlan = activeOrganization
		? paymentsConfig.billingAttachedTo === "organization"
			? orgActivePlan
			: null
		: paymentsConfig.billingAttachedTo === "user"
			? userActivePlan
			: null;
	const planTitle = activePlan
		? (planData[activePlan.id as keyof typeof planData]?.title ?? null)
		: null;
	const activeName = activeOrganization
		? activeOrganization.name
		: t("organizations.organizationSelect.personalAccount");

	const selectPersonalAccount = async () => {
		await setActiveOrganization(null);
		void router.navigate({ to: "/", replace: true });
	};

	const selectOrganization = async (organizationSlug: string) => {
		await setActiveOrganization(organizationSlug);
		void router.navigate({ to: `/${organizationSlug}`, replace: true });
	};

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
						{activeOrganization ? (
							<OrganizationLogo
								name={activeOrganization.name}
								logoUrl={activeOrganization.logo}
								className="rounded-lg"
							/>
						) : (
							<PersonalAccountIcon />
						)}
						<div className="text-sm leading-tight grid flex-1 text-left">
							<span className="font-medium truncate">{activeName}</span>
							{planTitle && <span className="text-xs truncate">{planTitle}</span>}
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
							{!authConfig.organizations.requireOrganization && (
								<>
									<DropdownMenuItem onClick={selectPersonalAccount} className="gap-2 p-2">
										<PersonalAccountIcon className="size-6 rounded-md" />
										{t("organizations.organizationSelect.personalAccount")}
										<ActiveCheck active={!activeOrganization} />
									</DropdownMenuItem>
									<DropdownMenuSeparator />
								</>
							)}
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								{t("organizations.organizationSelect.organizations")}
							</DropdownMenuLabel>
							{allOrganizations?.map((organization) => (
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
									<ActiveCheck active={activeOrganization?.id === organization.id} />
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
						{authConfig.organizations.enableUsersToCreateOrganizations && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem
										nativeButton={false}
										className="gap-2 p-2"
										render={<Link to="/new-organization" />}
									>
										<div className="size-6 flex items-center justify-center rounded-md border bg-transparent">
											<PlusIcon aria-hidden="true" className="size-4" />
										</div>
										<div className="font-medium text-muted-foreground">
											{t("organizations.organizationSelect.createNewOrganization")}
										</div>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
