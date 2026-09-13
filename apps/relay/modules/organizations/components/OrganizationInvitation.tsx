import { sessionQueryOptions } from "@auth/lib/api";
import type { InvitationLookup } from "@auth/lib/auth-server.server";
import { useTranslations } from "@i18n/intl";
import { organizationListQueryOptions } from "@organizations/lib/api";
import { memberRole } from "@organizations/lib/roles";
import { authClient } from "@repo/relay/auth/client";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { OrganizationLogo } from "./OrganizationLogo";

export function OrganizationInvitation({
	invitationId,
	lookup,
	userEmail,
}: {
	invitationId: string;
	lookup: InvitationLookup;
	userEmail: string;
}) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [submitting, setSubmitting] = useState<false | "accept" | "reject">(false);

	const answer = async (accept: boolean) => {
		if (lookup.status !== "pending") {
			return;
		}
		const { invitation } = lookup;
		setSubmitting(accept ? "accept" : "reject");

		try {
			if (accept) {
				const { error } = await authClient.organization.acceptInvitation({ invitationId });

				if (error) {
					throw error;
				}

				// Accepting made this the active organization on the server; the
				// layout reads both from the query cache before it re-runs.
				queryClient.setQueryData(sessionQueryOptions().queryKey, (current) =>
					current
						? {
								...current,
								session: { ...current.session, activeOrganizationId: invitation.organizationId },
							}
						: current,
				);
				await queryClient.fetchQuery({ ...organizationListQueryOptions(), staleTime: 0 });

				void router.navigate({
					to: "/$organizationSlug",
					params: { organizationSlug: invitation.organizationSlug },
					replace: true,
				});
			} else {
				const { error } = await authClient.organization.rejectInvitation({ invitationId });

				if (error) {
					throw error;
				}

				void router.navigate({ to: "/", replace: true });
			}
		} catch {
			toast.add({ title: t("organizations.invitation.error"), type: "error" });
			// The answer failed because the invitation changed underneath: show its state.
			void router.invalidate();
		} finally {
			setSubmitting(false);
		}
	};

	const switchAccount = async () => {
		await authClient.signOut();
		window.location.href = `/login?redirectTo=${encodeURIComponent(`/invitations/${invitationId}`)}`;
	};

	if (lookup.status === "invalid") {
		return (
			<div className="gap-6 flex flex-col">
				<div>
					<h1 className="text-2xl font-semibold">{t("organizations.invitation.invalid.title")}</h1>
					<p className="mt-1 text-muted-foreground">
						{t("organizations.invitation.invalid.description")}
					</p>
				</div>
				<Button variant="secondary" nativeButton={false} render={<Link to="/" />}>
					{t("errors.home")}
				</Button>
			</div>
		);
	}

	if (lookup.status === "notRecipient") {
		return (
			<div className="gap-6 flex flex-col">
				<div>
					<h1 className="text-2xl font-semibold">
						{t("organizations.invitation.notRecipient.title")}
					</h1>
					<p className="mt-1 text-muted-foreground">
						{t("organizations.invitation.notRecipient.description", { email: userEmail })}
					</p>
				</div>
				<div className="gap-2 flex">
					<Button
						className="flex-1"
						variant="secondary"
						nativeButton={false}
						render={<Link to="/" />}
					>
						{t("errors.home")}
					</Button>
					<Button className="flex-1" onClick={switchAccount}>
						{t("organizations.invitation.switchAccount")}
					</Button>
				</div>
			</div>
		);
	}

	const { invitation } = lookup;

	return (
		<div className="gap-6 flex flex-col">
			<div>
				<h1 className="text-2xl font-semibold">{t("organizations.invitation.title")}</h1>
				<p className="mt-1 text-muted-foreground">
					{t("organizations.invitation.description", {
						inviter: invitation.inviterEmail,
						role: t(`organizations.roles.${memberRole(invitation.role)}`),
					})}
				</p>
			</div>

			<div className="gap-3 p-3 flex items-center rounded-lg border">
				<OrganizationLogo name={invitation.organizationName} className="size-10 rounded-lg" />
				<div className="min-w-0">
					<strong className="font-medium block truncate">{invitation.organizationName}</strong>
					<span className="text-xs block truncate text-muted-foreground">
						{t("organizations.invitation.signedInAs", { email: userEmail })}
					</span>
				</div>
			</div>

			<div className="gap-2 flex">
				<Button
					className="flex-1"
					variant="secondary"
					onClick={() => answer(false)}
					disabled={!!submitting}
				>
					{submitting === "reject" ? (
						<Spinner data-icon="inline-start" />
					) : (
						<XIcon data-icon="inline-start" />
					)}
					{t("organizations.invitation.decline")}
				</Button>
				<Button className="flex-1" onClick={() => answer(true)} disabled={!!submitting}>
					{submitting === "accept" ? (
						<Spinner data-icon="inline-start" />
					) : (
						<CheckIcon data-icon="inline-start" />
					)}
					{t("organizations.invitation.accept")}
				</Button>
			</div>
		</div>
	);
}
