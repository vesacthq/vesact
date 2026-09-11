import { accountCenterUrl } from "@auth/lib/account-urls";
import { useTranslations } from "@i18n/intl";
import { activeOrganizationQueryOptions } from "@organizations/lib/api";
import { config as authConfig } from "@repo/auth/config";
import { checkPermission } from "@repo/permissions";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { createFileRoute, notFound, Outlet, redirect } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";

/**
 * Membership alone does not open Studio: the organization's admins grant a
 * Studio role per member in the account center. Owners and admins always pass.
 */
export const Route = createFileRoute("/_authenticated/_main/$organizationSlug")({
	beforeLoad: () => {
		if (!authConfig.organizations.enable) {
			throw redirect({ to: "/" });
		}
	},
	loader: async ({ params, context: { queryClient, session, activeOrganization } }) => {
		const organization =
			activeOrganization?.slug === params.organizationSlug
				? activeOrganization
				: await queryClient.ensureQueryData(
						activeOrganizationQueryOptions({ slug: params.organizationSlug }),
					);

		if (!organization) {
			throw notFound();
		}

		const membership = organization.members.find((member) => member.userId === session.user.id);
		const allowed = checkPermission(
			{ user: session.user, membershipRole: membership?.role },
			"studio.access",
		);

		return { allowed, organizationName: organization.name };
	},
	component: OrganizationLayout,
});

function OrganizationLayout() {
	const { allowed, organizationName } = Route.useLoaderData();
	const { organizationSlug } = Route.useParams();

	if (!allowed) {
		return (
			<NoStudioAccess organizationName={organizationName} organizationSlug={organizationSlug} />
		);
	}

	return <Outlet />;
}

function NoStudioAccess({
	organizationName,
	organizationSlug,
}: {
	organizationName: string;
	organizationSlug: string;
}) {
	const t = useTranslations();

	return (
		<Card className="max-w-xl">
			<CardContent className="gap-4 flex flex-col">
				<div>
					<h2 className="font-semibold text-lg">{t("organizations.noAccess.title")}</h2>
					<p className="mt-1 text-sm text-foreground/60">
						{t("organizations.noAccess.description", { organization: organizationName })}
					</p>
				</div>
				<div>
					<Button
						variant="secondary"
						nativeButton={false}
						render={(props) => (
							<a {...props} href={accountCenterUrl(`/orgs/${organizationSlug}/members`, "/")}>
								<ExternalLinkIcon aria-hidden="true" />
								{t("organizations.noAccess.members")}
							</a>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
