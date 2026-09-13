import { useTranslations } from "@i18n/intl";
import { organizationListQueryKey, setActiveOrganization } from "@organizations/lib/api";
import { authClient } from "@repo/relay/auth/client";
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
import slugify from "slugify";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3).max(32),
});

// Slugs are not chosen by hand in Relay; a short random suffix keeps them unique.
function slugFor(name: string) {
	return `${slugify(name, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CreateOrganizationForm() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: { name: "" },
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value: { name } }) => {
			const { data: organization, error } = await authClient.organization.create({
				name,
				slug: slugFor(name),
			});

			if (error || !organization) {
				toast.add({ title: t("organizations.create.error"), type: "error" });
				return;
			}

			await setActiveOrganization(organization.slug);
			await queryClient.invalidateQueries({ queryKey: organizationListQueryKey });

			void router.navigate({
				to: "/$organizationSlug",
				params: { organizationSlug: organization.slug },
				replace: true,
			});
		},
	});

	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<Form form={form}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<FormField name="name">
					{(field) => (
						<FormItem>
							<FormLabel>{t("organizations.create.name")}</FormLabel>
							<FormControl>
								<Input
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				</FormField>

				<Button className="mt-6 w-full" type="submit" disabled={isSubmitting}>
					{isSubmitting && <Spinner data-icon="inline-start" />}
					{t("organizations.create.submit")}
				</Button>
			</form>
		</Form>
	);
}
