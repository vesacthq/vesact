import { useTranslations } from "@i18n/intl";
import { productNames } from "@organizations/hooks/member-roles";
import { useOrganization } from "@organizations/hooks/use-organization";
import { authClient } from "@repo/auth/client";
import {
	getOrganizationRole,
	getProductRole,
	type MemberRole,
	organizationRoles,
	type ProductRole,
	products,
	withProductRole,
} from "@repo/permissions";
import { Button } from "@repo/ui/components/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";

import { OrganizationRoleSelect } from "./OrganizationRoleSelect";
import { ProductRoleSelect } from "./ProductRoleSelect";

const formSchema = z.object({
	email: z.email(),
	role: z.enum(organizationRoles),
});

const DEFAULT_VALUES: z.infer<typeof formSchema> = {
	email: "",
	role: "member",
};

const DEFAULT_PRODUCT_ROLES: ProductRole[] = ["studio:member"];

export function InviteMemberForm() {
	const t = useTranslations();
	const { organization, roles: ownRoles, refetch } = useOrganization();
	const [productRolesToGrant, setProductRolesToGrant] =
		useState<ProductRole[]>(DEFAULT_PRODUCT_ROLES);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			const isOrganizationAdmin = value.role === "owner" || value.role === "admin";
			const roles: MemberRole[] = isOrganizationAdmin
				? [value.role]
				: [value.role, ...productRolesToGrant];

			try {
				const { error } = await authClient.organization.inviteMember({
					email: value.email,
					role: roles,
					organizationId: organization.id,
				});

				if (error) {
					throw error;
				}

				formApi.reset(DEFAULT_VALUES);
				setProductRolesToGrant(DEFAULT_PRODUCT_ROLES);
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
	const organizationRole = useStore(form.store, (s) => s.values.role);
	const isOrganizationAdmin = organizationRole === "owner" || organizationRole === "admin";

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
												allowOwner={getOrganizationRole(ownRoles) === "owner"}
											/>
										</FormControl>
									</FormItem>
								)}
							</FormField>
						</div>
					</div>

					<div className="mt-4">
						<p className="mb-2 font-medium text-sm">
							{t("organizations.settings.members.inviteMember.access")}
						</p>
						{isOrganizationAdmin ? (
							<p className="text-sm text-foreground/60">
								{t("organizations.productAccess.fullDescription")}
							</p>
						) : (
							<div className="@md:grid-cols-2 gap-2 grid">
								{products.map((product) => (
									<div key={product} className="gap-2 grid">
										<Label htmlFor={`invite-${product}`}>{productNames[product]}</Label>
										<ProductRoleSelect
											id={`invite-${product}`}
											product={product}
											value={getProductRole(productRolesToGrant, product)}
											onSelect={(role) =>
												setProductRolesToGrant(
													withProductRole(productRolesToGrant, product, role).filter(
														(entry): entry is ProductRole => entry.includes(":"),
													),
												)
											}
										/>
									</div>
								))}
							</div>
						)}
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
