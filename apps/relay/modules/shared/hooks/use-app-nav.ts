import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { useLocalePathname } from "@i18n/routing";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { BookOpenIcon, HomeIcon, KeyRoundIcon, type LucideIcon, UsersIcon } from "lucide-react";
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
	const organization = useActiveOrganization();

	const items = useMemo<AppNavItem[]>(() => {
		const basePath = organization ? `/${organization.slug}` : "";
		const apiKeysPath = `${basePath}/settings/api-keys`;
		const membersPath = `${basePath}/settings/members`;

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
				label: t("app.menu.members"),
				href: membersPath,
				icon: UsersIcon,
				isActive: pathname.startsWith(membersPath),
			},
			{
				label: t("app.menu.apiReference"),
				href: `${config.apiUrl}/v1/docs`,
				icon: BookOpenIcon,
				isActive: false,
				external: true,
			},
		];
	}, [organization, pathname, t]);

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
