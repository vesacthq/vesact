import { useCreateApiKeyMutation } from "@api-keys/lib/api";
import { useTranslations } from "@i18n/intl";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/reui/alert";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { useForm, useStore } from "@tanstack/react-form";
import { CheckIcon, CopyIcon, TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().trim().min(1).max(64),
});

export function CreateApiKeyDialog({
	organizationId,
	open,
	onOpenChange,
}: {
	organizationId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const t = useTranslations();
	const createApiKey = useCreateApiKeyMutation(organizationId);
	const [createdKey, setCreatedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const form = useForm({
		defaultValues: { name: "" },
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value: { name } }) => {
			try {
				const apiKey = await createApiKey.mutateAsync({ name: name.trim() });
				setCreatedKey(apiKey.key);
			} catch {
				toast.add({ title: t("apiKeys.create.error"), type: "error" });
			}
		},
	});
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	// Dismissing mid-request would let the response land in a closed dialog
	// and show the secret on the next open.
	const setOpen = (nextOpen: boolean) => {
		if (!nextOpen && isSubmitting) {
			return;
		}

		onOpenChange(nextOpen);

		if (!nextOpen) {
			form.reset();
			setCreatedKey(null);
			setCopied(false);
		}
	};

	const copy = async () => {
		if (createdKey) {
			await navigator.clipboard.writeText(createdKey);
			setCopied(true);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				{createdKey ? (
					<>
						<DialogHeader>
							<DialogTitle>{t("apiKeys.created.title")}</DialogTitle>
							<DialogDescription>{t("apiKeys.created.description")}</DialogDescription>
						</DialogHeader>
						<Alert variant="warning">
							<TriangleAlertIcon aria-hidden="true" />
							<AlertTitle>{t("apiKeys.created.onceTitle")}</AlertTitle>
							<AlertDescription>{t("apiKeys.created.onceDescription")}</AlertDescription>
						</Alert>
						<div className="gap-2 flex items-start">
							<code className="min-w-0 px-3 py-2 font-mono text-xs flex-1 rounded-md border bg-muted/40 break-all">
								{createdKey}
							</code>
							<Button variant="outline" size="sm" className="shrink-0" onClick={copy}>
								{copied ? (
									<CheckIcon className="size-4" aria-hidden="true" />
								) : (
									<CopyIcon className="size-4" aria-hidden="true" />
								)}
								{copied ? t("apiKeys.created.copied") : t("apiKeys.created.copy")}
							</Button>
						</div>
						<DialogFooter>
							<Button onClick={() => setOpen(false)}>{t("apiKeys.created.done")}</Button>
						</DialogFooter>
					</>
				) : (
					<Form form={form}>
						<form
							className="gap-6 flex flex-col"
							onSubmit={(event) => {
								event.preventDefault();
								event.stopPropagation();
								void form.handleSubmit();
							}}
						>
							<DialogHeader>
								<DialogTitle>{t("apiKeys.create.title")}</DialogTitle>
								<DialogDescription>{t("apiKeys.create.description")}</DialogDescription>
							</DialogHeader>
							<FormField name="name">
								{(field) => (
									<FormItem>
										<FormLabel>{t("apiKeys.create.name")}</FormLabel>
										<FormControl>
											<Input
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) => field.handleChange(event.target.value)}
												placeholder={t("apiKeys.create.namePlaceholder")}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							</FormField>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setOpen(false)}>
									{t("common.confirmation.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Spinner data-icon="inline-start" />}
									{t("apiKeys.create.submit")}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}
