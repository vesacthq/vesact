import { useTranslations } from "@i18n/intl";
import { useLocalePathname } from "@i18n/routing";
import { OrganizationLogo } from "@organizations/components/OrganizationLogo";
import { useOrganizationListQuery } from "@organizations/lib/api";
import { cn } from "@repo/ui";
import { Link } from "@tanstack/react-router";
import { BellIcon, PlusIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import type { ReactNode } from "react";

function isActive(pathname: string, href: string, exact = false) {
	return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
	to,
	params,
	active,
	children,
}: {
	to: string;
	params?: Record<string, string>;
	active: boolean;
	children: ReactNode;
}) {
	return (
		<Link
			to={to}
			params={params}
			search={true}
			className={cn(
				"gap-2 px-3 py-2 text-sm flex items-center rounded-md transition-colors hover:bg-muted",
				active ? "font-medium bg-muted text-foreground" : "text-foreground/70",
			)}
			aria-current={active ? "page" : undefined}
		>
			{children}
		</Link>
	);
}

function NavGroup({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div>
			<p className="mb-1 px-3 text-xs font-medium tracking-wide text-foreground/50 uppercase">
				{title}
			</p>
			<div className="gap-0.5 flex flex-col">{children}</div>
		</div>
	);
}

export function SettingsNav() {
	const t = useTranslations();
	const pathname = useLocalePathname();
	const { data: organizations } = useOrganizationListQuery();

	return (
		<nav className="gap-6 flex flex-col">
			<NavGroup title={t("settings.menu.account.title")}>
				<NavLink to="/account" active={isActive(pathname, "/account", true)}>
					<UserIcon className="size-4" aria-hidden="true" />
					{t("settings.menu.account.profile")}
				</NavLink>
				<NavLink to="/account/security" active={isActive(pathname, "/account/security")}>
					<ShieldCheckIcon className="size-4" aria-hidden="true" />
					{t("settings.menu.account.security")}
				</NavLink>
				<NavLink to="/account/notifications" active={isActive(pathname, "/account/notifications")}>
					<BellIcon className="size-4" aria-hidden="true" />
					{t("settings.menu.account.notifications")}
				</NavLink>
			</NavGroup>

			<NavGroup title={t("settings.menu.organizations.title")}>
				{organizations?.map((organization) => (
					<NavLink
						key={organization.id}
						to="/orgs/$organizationSlug"
						params={{ organizationSlug: organization.slug }}
						active={isActive(pathname, `/orgs/${organization.slug}`)}
					>
						<OrganizationLogo
							name={organization.name}
							logoUrl={organization.logo}
							className="size-5 rounded-md"
						/>
						<span className="truncate">{organization.name}</span>
					</NavLink>
				))}
				<NavLink to="/orgs/new" active={isActive(pathname, "/orgs/new")}>
					<PlusIcon className="size-4" aria-hidden="true" />
					{t("settings.menu.organizations.new")}
				</NavLink>
			</NavGroup>
		</nav>
	);
}
