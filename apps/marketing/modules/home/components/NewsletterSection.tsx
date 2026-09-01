import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { formatFormRootError } from "@repo/ui/components/form-root-error";
import { Input } from "@repo/ui/components/input";
import { useForm, useStore } from "@tanstack/react-form";
import { CheckCircleIcon, MailIcon } from "lucide-react";
import { useTranslations } from "use-intl";
import { z } from "zod";

const formSchema = z.object({
	email: z.email(),
});

function firstFieldError(errors: unknown[]): string | undefined {
	if (!errors.length) {
		return undefined;
	}
	const first = errors[0];
	if (typeof first === "string") {
		return first;
	}
	if (first && typeof first === "object" && "message" in first) {
		const message = (first as { message?: unknown }).message;
		if (typeof message === "string") {
			return message;
		}
	}
	return String(first);
}

export function NewsletterSection() {
	const t = useTranslations();
	const form = useForm({
		defaultValues: { email: "" },
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ formApi, value }) => {
			try {
				// TODO: Insert your newsletter signup logic here to integrate with your CRM or email service
				void value.email;
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch {
				formApi.setErrorMap({
					onSubmit: {
						form: t("newsletter.hints.error.message"),
						fields: {},
					},
				});
			}
		},
	});

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const isSubmitSuccessful = useStore(form.store, (s) => s.isSubmitSuccessful);
	const formErrors = useStore(form.store, (s) => s.errors);
	const rootError = formatFormRootError(formErrors);

	return (
		<section className="py-16 lg:py-20 border-t border-border/60">
			<div className="container">
				{isSubmitSuccessful ? (
					<Alert variant="success">
						<CheckCircleIcon />
						<AlertTitle>{t("newsletter.hints.success.title")}</AlertTitle>
						<AlertDescription>{t("newsletter.hints.success.message")}</AlertDescription>
					</Alert>
				) : (
					<form
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
						className="gap-6 md:grid-cols-[1fr_auto] md:items-end grid grid-cols-1"
					>
						<div className="max-w-md">
							<h2 className="font-medium text-lg tracking-tight gap-2.5 flex items-center text-foreground">
								<MailIcon className="size-5 text-primary" />
								{t("newsletter.title")}
							</h2>
							<p className="mt-1.5 text-sm leading-relaxed text-foreground/50">
								{t("newsletter.subtitle")}
							</p>
						</div>
						<form.Field name="email">
							{(field) => {
								const fieldError = firstFieldError(field.state.meta.errors);
								const displayError = rootError ?? fieldError;
								return (
									<>
										<div className="sm:flex-row sm:items-start gap-2 flex flex-col items-stretch">
											<Input
												type="email"
												required
												placeholder={t("newsletter.email")}
												className="md:w-64"
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) => field.handleChange(event.target.value)}
											/>
											<Button
												type="submit"
												className="bg-primary text-primary-foreground hover:bg-primary/90"
												loading={isSubmitting}
											>
												{t("newsletter.submit")}
											</Button>
										</div>
										{displayError ? (
											<p className="text-xs md:col-start-2 text-destructive">{displayError}</p>
										) : null}
									</>
								);
							}}
						</form.Field>
					</form>
				)}
			</div>
		</section>
	);
}
