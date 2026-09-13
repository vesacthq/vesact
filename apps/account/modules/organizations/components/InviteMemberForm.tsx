import { useTranslations } from "@i18n/intl";
import { useOrganization } from "@organizations/hooks/use-organization";
import { authClient } from "@repo/auth/client";
import { organizationRoles } from "@repo/permissions";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useForm, useStore } from "@tanstack/react-form";
import { z } from "zod";

import { OrganizationRoleSelect } from "./OrganizationRoleSelect";

const formSchema = z.object({
	email: z.email(),
	role: z.enum(organizationRoles),
});

const DEFAULT_VALUES: z.infer<typeof formSchema> = {
	email: "",
	role: "member",
};

export function InviteMemberForm() {
	const t = useTranslations();
	const { organization, role: ownRole, refetch } = useOrganization();

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			try {
				const { error } = await authClient.organization.inviteMember({
					email: value.email,
					role: value.role,
					organizationId: organization.id,
				});

				if (error) {
					throw error;
				}

				formApi.reset(DEFAULT_VALUES);
				await refetch();

				toast.add({
					title: t("organizations.settings.members.inviteMember.notifications.success.title"),
					type: "success",
				});
			} catch {
				toast.add({
					title: t("organizations.settings.members.inviteMember.notifications.error.title"),
					type: "error",
				});
			}
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

	return (
		<SettingsItem
			title={t("organizations.settings.members.inviteMember.title")}
			description={t("organizations.settings.members.inviteMember.description")}
		>
			<Form form={form}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="@container"
				>
					<div className="@md:flex-row gap-2 flex flex-col">
						<div className="flex-1">
							<FormField name="email">
								{(field) => (
									<FormItem>
										<FormLabel>{t("organizations.settings.members.inviteMember.email")}</FormLabel>
										<FormControl>
											<Input
												type="email"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
										</FormControl>
									</FormItem>
								)}
							</FormField>
						</div>

						<div>
							<FormField name="role">
								{(field) => (
									<FormItem>
										<FormLabel>{t("organizations.settings.members.inviteMember.role")}</FormLabel>
										<FormControl>
											<OrganizationRoleSelect
												value={field.state.value}
												onSelect={(next) => field.handleChange(next)}
												allowOwner={ownRole === "owner"}
											/>
										</FormControl>
									</FormItem>
								)}
							</FormField>
						</div>
					</div>

					<div className="mt-4 flex justify-end">
						<Button variant="secondary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <Spinner data-icon="inline-start" />}
							{t("organizations.settings.members.inviteMember.submit")}
						</Button>
					</div>
				</form>
			</Form>
		</SettingsItem>
	);
}
