import { getAdminPath } from "@admin/lib/links";
import { accountCenterUrl } from "@auth/lib/account-urls";
import { useTranslations } from "@i18n/intl";
import {
	fullOrganizationQueryKey,
	organizationListQueryKey,
	useCreateOrganizationMutation,
	useFullOrganizationQuery,
	useUpdateOrganizationMutation,
} from "@organizations/lib/api";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";
import { z } from "zod";

const organizationFormSchema = z.object({
	name: z.string().min(1),
});

export function OrganizationForm({ organizationId }: { organizationId: string }) {
	const t = useTranslations();
	const router = useRouter();
	const currentHref = useRouterState({ select: (state) => state.location.href });

	const { data: organization } = useFullOrganizationQuery(organizationId);

	const updateOrganizationMutation = useUpdateOrganizationMutation();
	const createOrganizationMutation = useCreateOrganizationMutation();
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			name: organization?.name ?? "",
		},
		validators: {
			onSubmit: organizationFormSchema,
		},
		onSubmit: async ({ value: { name } }) => {
			try {
				const newOrganization = organization
					? await updateOrganizationMutation.mutateAsync({
							id: organization.id,
							name,
							updateSlug: organization.name !== name,
						})
					: await createOrganizationMutation.mutateAsync({ name });

				if (!newOrganization) {
					throw new Error("Could not save organization");
				}

				queryClient.setQueryData(fullOrganizationQueryKey(organizationId), newOrganization);

				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: orpc.admin.organizations.list.key(),
					}),
					queryClient.invalidateQueries({
						queryKey: organizationListQueryKey,
					}),
				]);

				toast.add({ title: t("admin.organizations.form.notifications.success"), type: "success" });

				if (!organization) {
					void router.navigate({
						to: getAdminPath(`/organizations/${newOrganization.id}`),
						replace: true,
					});
				}
			} catch {
				toast.add({ title: t("admin.organizations.form.notifications.error"), type: "error" });
			}
		},
	});

	const isSaving = updateOrganizationMutation.isPending || createOrganizationMutation.isPending;

	return (
		<div className="gap-4 grid grid-cols-1">
			<Card>
				<CardHeader>
					<CardTitle>
						{organization
							? t("admin.organizations.form.updateTitle")
							: t("admin.organizations.form.createTitle")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form form={form}>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								void form.handleSubmit();
							}}
							className="gap-4 grid grid-cols-1"
						>
							<FormField name="name">
								{(field) => (
									<FormItem>
										<FormLabel>{t("admin.organizations.form.name")}</FormLabel>
										<FormControl>
											<Input
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							</FormField>

							<div className="flex justify-end">
								<Button variant="secondary" type="submit" disabled={isSaving}>
									{isSaving && <Spinner data-icon="inline-start" />}
									{t("admin.organizations.form.save")}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{organization && (
				<Card>
					<CardContent className="gap-4 flex flex-wrap items-center justify-between">
						<p className="text-sm text-foreground/60">
							{t("admin.organizations.form.membersNote")}
						</p>
						<Button
							variant="secondary"
							nativeButton={false}
							render={(props) => (
								<a
									{...props}
									href={accountCenterUrl(`/orgs/${organization.slug}/members`, currentHref)}
								>
									<ExternalLinkIcon aria-hidden="true" />
									{t("admin.organizations.form.openMembers")}
								</a>
							)}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
