import { accountCenterUrl } from "@auth/lib/account-urls";
import { useTranslations } from "@i18n/intl";
import { organizationQueryOptions } from "@organizations/lib/api";
import { checkPermission } from "@repo/permissions";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";

/**
 * Membership alone does not open Relay: the organization's admins grant a
 * Relay role per member in the account center. Owners and admins always pass.
 * Better Auth answers a non-member's lookup like a missing organization.
 */
export const Route = createFileRoute("/_authenticated/$organizationSlug")({
	loader: async ({ params, context: { queryClient, session } }) => {
		const organization = await queryClient.ensureQueryData(
			organizationQueryOptions(params.organizationSlug),
		);

		if (!organization) {
			throw notFound();
		}

		const membership = organization.members.find((member) => member.userId === session.user.id);
		const allowed = checkPermission(
			{ user: session.user, membershipRole: membership?.role },
			"relay.access",
		);

		return {
			allowed,
			organization: { id: organization.id, name: organization.name, slug: organization.slug },
		};
	},
	component: OrganizationLayout,
});

function OrganizationLayout() {
	const { allowed, organization } = Route.useLoaderData();

	if (!allowed) {
		return (
			<NoRelayAccess organizationName={organization.name} organizationSlug={organization.slug} />
		);
	}

	return <Outlet />;
}

function NoRelayAccess({
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
