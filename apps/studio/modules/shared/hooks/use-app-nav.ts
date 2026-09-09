import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { useLocalePathname } from "@i18n/routing";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { config as authConfig } from "@repo/auth/config";
import { config as paymentsConfig } from "@repo/payments/config";
import { usePermissions } from "@shared/components/PermixProvider";
import { useRouteContext } from "@tanstack/react-router";
import {
	BotMessageSquareIcon,
	HomeIcon,
	type LucideIcon,
	SettingsIcon,
	ShieldUserIcon,
	UserCogIcon,
} from "lucide-react";
import { useMemo } from "react";

export interface AppNavChild {
	label: string;
	href: string;
	isActive: boolean;
}

export interface AppNavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	isActive: boolean;
	children?: AppNavChild[];
}

export interface AppNavCrumb {
	label: string;
	href: string;
}

function isPathActive(pathname: string, href: string): boolean {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function useAppNav() {
	const t = useTranslations();
	const pathname = useLocalePathname();
	const { permix } = useRouteContext({ from: "__root__" });
	const { check } = usePermissions(permix);
	const { activeOrganization } = useActiveOrganization();
	const canAccessAdmin = check("admin.access");
	const canManageOrganization = check("organization.manage");
	const canManageOrganizationBilling = check("organization.manageBilling");

	const basePath = activeOrganization ? `/${activeOrganization.slug}` : "";
	const startHref = basePath || "/";

	const items = useMemo<AppNavItem[]>(() => {
		const child = (label: string, href: string): AppNavChild => ({
			label,
			href,
			isActive: isPathActive(pathname, href),
		});

		const accountChildren = [
			child(t("settings.menu.account.general"), "/settings/general"),
			child(t("settings.menu.account.security"), "/settings/security"),
			child(t("settings.menu.account.notifications"), "/settings/notifications"),
			...(paymentsConfig.billingAttachedTo === "user"
				? [child(t("settings.menu.account.billing"), "/settings/billing")]
				: []),
		];

		const orgSettingsPrefix = `${basePath}/settings`;
		const organizationChildren =
			authConfig.organizations.enable && activeOrganization && canManageOrganization
				? [
						child(t("settings.menu.organization.general"), `${orgSettingsPrefix}/general`),
						child(t("settings.menu.organization.members"), `${orgSettingsPrefix}/members`),
						...(paymentsConfig.billingAttachedTo === "organization" && canManageOrganizationBilling
							? [child(t("settings.menu.organization.billing"), `${orgSettingsPrefix}/billing`)]
							: []),
					]
				: undefined;

		const adminChildren = [
			child(t("admin.menu.users"), "/admin/users"),
			...(authConfig.organizations.enable
				? [child(t("admin.menu.organizations"), "/admin/organizations")]
				: []),
		];

		return [
			{
				label: t("app.menu.start"),
				href: startHref,
				icon: HomeIcon,
				isActive: pathname === "/" || pathname === basePath,
			},
			...(config.enableAiDemo
				? [
						{
							label: t("app.menu.aiChatbot"),
							href: "/chatbot",
							icon: BotMessageSquareIcon,
							isActive: pathname.startsWith("/chatbot"),
						},
					]
				: []),
			...(organizationChildren
				? [
						{
							label: t("app.menu.organizationSettings"),
							href: `${orgSettingsPrefix}/general`,
							icon: SettingsIcon,
							isActive: pathname.startsWith(`${orgSettingsPrefix}/`),
							children: organizationChildren,
						},
					]
				: []),
			{
				label: t("app.menu.accountSettings"),
				href: "/settings/general",
				icon: UserCogIcon,
				isActive: pathname.startsWith("/settings/"),
				children: accountChildren,
			},
			...(canAccessAdmin
				? [
						{
							label: t("app.menu.admin"),
							href: "/admin/users",
							icon: ShieldUserIcon,
							isActive: pathname.startsWith("/admin/"),
							children: adminChildren,
						},
					]
				: []),
		];
	}, [
		activeOrganization,
		basePath,
		canAccessAdmin,
		canManageOrganization,
		canManageOrganizationBilling,
		pathname,
		startHref,
		t,
	]);

	const trail = useMemo<AppNavCrumb[]>(() => {
		const activeItem = items.find((item) => item.isActive);
		if (!activeItem) {
			return [];
		}
		const activeChild = activeItem.children?.find((item) => item.isActive);
		return [
			{ label: activeItem.label, href: activeItem.href },
			...(activeChild ? [{ label: activeChild.label, href: activeChild.href }] : []),
		];
	}, [items]);

	return { items, trail };
}
