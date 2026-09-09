import { useSession } from "@auth/hooks/use-session";
import { sessionQueryKey } from "@auth/lib/api";
import { activeOrganizationQueryKey, useActiveOrganizationQuery } from "@organizations/lib/api";
import type { ActiveOrganization } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { config as paymentsConfig } from "@repo/payments/config";
import { createPermissionRules } from "@repo/permissions";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouteContext } from "@tanstack/react-router";
import nProgress from "nprogress";
import { type ReactNode, useEffect, useState } from "react";

import { ActiveOrganizationContext } from "../lib/active-organization-context";

export function ActiveOrganizationProvider({
	children,
	initialActiveOrganization,
}: {
	children: ReactNode;
	initialActiveOrganization?: ActiveOrganization | null;
}) {
	const queryClient = useQueryClient();
	const { session, user } = useSession();
	const params = useParams({ strict: false }) as { organizationSlug?: string };

	const organizationSlug = params.organizationSlug;
	const activeOrganizationId = session?.activeOrganizationId;
	const activeOrganizationIdentifier = organizationSlug
		? { slug: organizationSlug }
		: activeOrganizationId
			? { id: activeOrganizationId }
			: { slug: undefined, id: undefined };
	const shouldUseInitialActiveOrganization =
		!!initialActiveOrganization &&
		(organizationSlug
			? initialActiveOrganization.slug === organizationSlug
			: initialActiveOrganization.id === activeOrganizationId);

	const { data: activeOrganization } = useActiveOrganizationQuery(activeOrganizationIdentifier, {
		enabled: !!organizationSlug || !!activeOrganizationId,
		initialData: shouldUseInitialActiveOrganization ? initialActiveOrganization : undefined,
	});

	const refetchActiveOrganization = async () => {
		await queryClient.refetchQueries({
			queryKey: activeOrganizationQueryKey(activeOrganizationIdentifier),
		});
	};

	const setActiveOrganization = async (organizationSlug: string | null) => {
		nProgress.start();
		const { data: newActiveOrganization } = await authClient.organization.setActive(
			organizationSlug
				? {
						organizationSlug,
					}
				: {
						organizationId: null,
					},
		);

		const newActiveOrganizationId = newActiveOrganization?.id ?? null;

		await authClient.updateUser({
			lastActiveOrganizationId: newActiveOrganizationId,
		} as Parameters<typeof authClient.updateUser>[0]);

		await queryClient.setQueryData(sessionQueryKey, (data: any) => {
			return {
				...data,
				session: {
					...data?.session,
					activeOrganizationId: newActiveOrganizationId,
				},
				user: {
					...data?.user,
					lastActiveOrganizationId: newActiveOrganizationId,
				},
			};
		});

		if (!newActiveOrganization) {
			nProgress.done();
			return;
		}

		await refetchActiveOrganization();

		if (paymentsConfig.billingAttachedTo === "organization") {
			await queryClient.prefetchQuery(
				orpc.payments.listPurchases.queryOptions({
					input: {
						organizationId: newActiveOrganization.id,
					},
				}),
			);
		}
	};

	const [loaded, setLoaded] = useState(activeOrganization !== undefined);

	useEffect(() => {
		if (!loaded && activeOrganization !== undefined) {
			setLoaded(true);
		}
	}, [activeOrganization]); // oxlint-disable-line eslint-plugin-react-hooks/exhaustive-deps

	const activeOrganizationUserRole = activeOrganization?.members.find(
		(member) => member.userId === session?.userId,
	)?.role;
	const { permix } = useRouteContext({ from: "__root__" });

	useEffect(() => {
		permix.setup(
			createPermissionRules({
				user,
				membershipRole: activeOrganizationUserRole ?? null,
			}),
		);
	}, [activeOrganizationUserRole, permix, user]);

	return (
		<ActiveOrganizationContext.Provider
			value={{
				loaded,
				activeOrganization: activeOrganization ?? null,
				activeOrganizationUserRole: activeOrganizationUserRole ?? null,
				setActiveOrganization,
				refetchActiveOrganization,
			}}
		>
			{children}
		</ActiveOrganizationContext.Provider>
	);
}
