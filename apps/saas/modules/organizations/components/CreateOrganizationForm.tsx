import { useTranslations } from "@i18n/intl";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { organizationListQueryKey, useCreateOrganizationMutation } from "@organizations/lib/api";
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
import { toast } from "@repo/ui/components/toast";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3).max(32),
});

export function CreateOrganizationForm({ defaultName }: { defaultName?: string }) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { setActiveOrganization } = useActiveOrganization();
	const createOrganizationMutation = useCreateOrganizationMutation();

	const form = useForm({
		defaultValues: {
			name: defaultName ?? "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value: { name } }) => {
			try {
				const newOrganization = await createOrganizationMutation.mutateAsync({ name });

				if (!newOrganization) {
					throw new Error("Failed to create organization");
				}

				await setActiveOrganization(newOrganization.slug);

				await queryClient.invalidateQueries({
					queryKey: organizationListQueryKey,
				});

				void router.navigate({ to: `/${newOrganization.slug}`, replace: true });
			} catch {
				toast.add({ title: t("organizations.createForm.notifications.error"), type: "error" });
			}
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

	return (
		<div className="max-w-md mx-auto w-full">
			<h1 className="font-bold text-xl md:text-2xl">{t("organizations.createForm.title")}</h1>
			<p className="mt-2 mb-6 text-foreground/60">{t("organizations.createForm.subtitle")}</p>

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

					<Button className="mt-6 w-full" type="submit" variant="primary" loading={isSubmitting}>
						{t("organizations.createForm.submit")}
					</Button>
				</form>
			</Form>
		</div>
	);
}
