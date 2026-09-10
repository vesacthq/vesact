import { accountCenterUrl } from "@auth/lib/account-urls";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { useLocalePathname } from "@i18n/routing";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { config as authConfig } from "@repo/auth/config";
import { usePermissions } from "@shared/components/PermixProvider";
import { useRouteContext, useRouterState } from "@tanstack/react-router";
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
	/** Absolute URL of an account center page; rendered as a plain link. */
	external?: boolean;
}

export interface AppNavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	isActive: boolean;
	external?: boolean;
	children?: AppNavChild[];
}

export interface AppNavCrumb {
	label: string;
	href: string;
}

export function useAppNav() {
	const t = useTranslations();
	const pathname = useLocalePathname();
	const currentHref = useRouterState({ select: (state) => state.location.href });
	const { permix } = useRouteContext({ from: "__root__" });
	const { check } = usePermissions(permix);
	const { activeOrganization } = useActiveOrganization();
	const canAccessAdmin = check("admin.access");
	const canManageOrganizationBilling = check("organization.manageBilling");

	const basePath = activeOrganization ? `/${activeOrganization.slug}` : "";
	const startHref = basePath || "/";

	const items = useMemo<AppNavItem[]>(() => {
		const child = (label: string, href: string): AppNavChild => ({
			label,
			href,
			isActive: pathname === href || pathname.startsWith(`${href}/`),
		});
		// Account center pages open with `from` so their back button returns here.
		const external = (label: string, path: string): AppNavChild => ({
			label,
			href: accountCenterUrl(path, currentHref),
			isActive: false,
			external: true,
		});

		const accountChildren = [
			external(t("settings.menu.account.profile"), "/account"),
			external(t("settings.menu.account.security"), "/account/security"),
			external(t("settings.menu.account.notifications"), "/account/notifications"),
		];

		const organizationChildren =
			authConfig.organizations.enable && activeOrganization
				? [
						external(t("settings.menu.organization.general"), `/orgs/${activeOrganization.slug}`),
						external(
							t("settings.menu.organization.members"),
							`/orgs/${activeOrganization.slug}/members`,
						),
						...(canManageOrganizationBilling
							? [
									external(
										t("settings.menu.organization.billing"),
										`/orgs/${activeOrganization.slug}/billing`,
									),
								]
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
							href: organizationChildren[0].href,
							icon: SettingsIcon,
							isActive: false,
							external: true,
							children: organizationChildren,
						},
					]
				: []),
			{
				label: t("app.menu.accountSettings"),
				href: accountChildren[0].href,
				icon: UserCogIcon,
				isActive: false,
				external: true,
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
		canManageOrganizationBilling,
		currentHref,
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
