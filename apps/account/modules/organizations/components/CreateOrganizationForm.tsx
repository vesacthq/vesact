import { useTranslations } from "@i18n/intl";
import {
	organizationListQueryKey,
	setActiveOrganization,
	useCreateOrganizationMutation,
} from "@organizations/lib/api";
import { Button } from "@repo/ui/components/button";
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
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3).max(32),
});

export function CreateOrganizationForm() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const createOrganizationMutation = useCreateOrganizationMutation();

	const form = useForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: { name } }) => {
			try {
				const organization = await createOrganizationMutation.mutateAsync({ name });

				if (!organization) {
					throw new Error("Failed to create organization");
				}

				await setActiveOrganization(organization.slug);
				await queryClient.invalidateQueries({ queryKey: organizationListQueryKey });

				void router.navigate({
					to: "/orgs/$organizationSlug",
					params: { organizationSlug: organization.slug },
					search: true,
					replace: true,
				});
			} catch {
				toast.add({ title: t("organizations.createForm.notifications.error"), type: "error" });
			}
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

	return (
		<div className="max-w-md w-full">
			<Form form={form}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<FormField name="name">
						{(field) => (
							<FormItem>
								<FormLabel>{t("organizations.createForm.name")}</FormLabel>
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

					<Button className="mt-6 w-full" type="submit" variant="default" disabled={isSubmitting}>
						{isSubmitting && <Spinner data-icon="inline-start" />}
						{t("organizations.createForm.submit")}
					</Button>
				</form>
			</Form>
		</div>
	);
}
