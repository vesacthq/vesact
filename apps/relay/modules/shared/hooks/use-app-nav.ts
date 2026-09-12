import { useSession } from "@auth/hooks/use-session";
import { accountCenterUrl } from "@auth/lib/account-urls";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { useLocalePathname } from "@i18n/routing";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { checkPermission } from "@repo/permissions";
import { useRouterState } from "@tanstack/react-router";
import {
	BookOpenIcon,
	HomeIcon,
	KeyRoundIcon,
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
	/** Absolute URL outside the console; rendered as a plain link. */
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
	const { user } = useSession();
	const organization = useActiveOrganization();
	const canAccessAdmin = checkPermission({ user }, "admin.access");

	const items = useMemo<AppNavItem[]>(() => {
		// Account center pages open with `from` so their back button returns here.
		const external = (label: string, path: string): AppNavChild => ({
			label,
			href: accountCenterUrl(path, currentHref),
			isActive: false,
			external: true,
		});

		const basePath = organization ? `/${organization.slug}` : "";
		const apiKeysPath = `${basePath}/settings/api-keys`;

		const organizationChildren = organization
			? [
					external(t("settings.menu.organization.general"), `/orgs/${organization.slug}`),
					external(t("settings.menu.organization.members"), `/orgs/${organization.slug}/members`),
				]
			: undefined;

		const accountChildren = [
			external(t("settings.menu.account.profile"), "/account"),
			external(t("settings.menu.account.security"), "/account/security"),
			external(t("settings.menu.account.notifications"), "/account/notifications"),
		];

		const adminChildren = [
			external(t("settings.menu.admin.users"), "/admin/users"),
			external(t("settings.menu.admin.organizations"), "/admin/organizations"),
		];

		return [
			{
				label: t("app.menu.overview"),
				href: basePath || "/",
				icon: HomeIcon,
				isActive: pathname === (basePath || "/"),
			},
			{
				label: t("app.menu.apiKeys"),
				href: apiKeysPath,
				icon: KeyRoundIcon,
				isActive: pathname.startsWith(apiKeysPath),
			},
			{
				label: t("app.menu.apiReference"),
				href: `${config.apiUrl}/v1/docs`,
				icon: BookOpenIcon,
				isActive: false,
				external: true,
			},
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
							href: adminChildren[0].href,
							icon: ShieldUserIcon,
							isActive: false,
							external: true,
							children: adminChildren,
						},
					]
				: []),
		];
	}, [canAccessAdmin, currentHref, organization, pathname, t]);

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
