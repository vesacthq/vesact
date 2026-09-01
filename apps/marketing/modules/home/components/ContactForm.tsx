import { Alert, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { formatFormRootError } from "@repo/ui/components/form-root-error";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { useForm, useStore } from "@tanstack/react-form";
import { MailCheckIcon, MailIcon } from "lucide-react";
import { useTranslations } from "use-intl";
import { z } from "zod";

const contactSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	message: z.string().min(10),
});

export function ContactForm() {
	const t = useTranslations("contact.form");
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			message: "",
		},
		validators: {
			onSubmit: contactSchema,
		},
		onSubmit: async ({ formApi }) => {
			try {
				// TODO: Insert your contact form submission logic here to integrate
				// with your CRM or email service.
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch {
				formApi.setErrorMap({
					onSubmit: {
						form: t("notifications.error"),
						fields: {},
					},
				});
			}
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const isSubmitSuccessful = useStore(form.store, (s) => s.isSubmitSuccessful);
	const formErrors = useStore(form.store, (s) => s.errors);
	const rootMessage = formatFormRootError(formErrors);

	return (
		<div>
			{isSubmitSuccessful ? (
				<Alert variant="success">
					<MailCheckIcon />
					<AlertTitle>{t("notifications.success")}</AlertTitle>
				</Alert>
			) : (
				<Form form={form}>
					<form
						className="gap-6 flex flex-col items-stretch"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							void form.handleSubmit();
						}}
					>
						{rootMessage ? (
							<Alert variant="error">
								<MailIcon />
								<AlertTitle>{rootMessage}</AlertTitle>
							</Alert>
						) : null}

						<FormField name="name">
							{(field) => (
								<FormItem>
									<FormLabel>{t("name")}</FormLabel>
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

						<FormField name="email">
							{(field) => (
								<FormItem>
									<FormLabel>{t("email")}</FormLabel>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
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

						<FormField name="message">
							{(field) => (
								<FormItem>
									<FormLabel>{t("message")}</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-36"
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

						<Button type="submit" className="w-full" variant="primary" loading={isSubmitting}>
							{t("submit")}
						</Button>
					</form>
				</Form>
			)}
		</div>
	);
}
