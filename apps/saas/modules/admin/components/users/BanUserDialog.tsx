import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
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
import { Textarea } from "@repo/ui/components/textarea";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";

type BanUser = {
	id: string;
	name: string | null;
	email: string;
};

type BanUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: BanUser | null;
};

function getLocalDateValue(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function getBanExpiresIn(expirationDate: string) {
	if (!expirationDate) {
		return undefined;
	}

	const expirationTime = new Date(`${expirationDate}T23:59:59.999`).getTime();

	return Math.max(1, Math.floor((expirationTime - Date.now()) / 1000));
}

export function BanUserDialog({ open, onOpenChange, user }: BanUserDialogProps) {
	const translations = useTranslations();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const today = getLocalDateValue(new Date());
	const banUserSchema = z.object({
		banReason: z.string().trim().min(1, translations("admin.users.ban.validation.reasonRequired")),
		expirationDate: z
			.string()
			.refine(
				(value) => !value || new Date(`${value}T23:59:59.999`).getTime() > Date.now(),
				translations("admin.users.ban.validation.expirationFuture"),
			),
	});
	const form = useForm({
		defaultValues: {
			banReason: "",
			expirationDate: "",
		},
		validators: {
			onSubmit: banUserSchema,
		},
		onSubmit: async ({ value: { banReason, expirationDate } }) => {
			if (!user) {
				return;
			}

			setIsSubmitting(true);

			try {
				if (!expirationDate) {
					const { error: clearExpirationError } = await authClient.admin.updateUser({
						userId: user.id,
						data: {
							banExpires: null,
						},
					});

					if (clearExpirationError) {
						throw clearExpirationError;
					}
				}

				const { error } = await authClient.admin.banUser({
					userId: user.id,
					banReason,
					banExpiresIn: getBanExpiresIn(expirationDate),
				});

				if (error) {
					throw error;
				}

				await queryClient.invalidateQueries({
					queryKey: orpc.admin.users.list.key(),
				});

				toastSuccess(translations("admin.users.ban.notifications.banSuccess"));
				onOpenChange(false);
			} catch {
				toastError(translations("admin.users.ban.notifications.banError"));
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	useEffect(() => {
		if (open) {
			form.reset();
		}
	}, [form, open, user]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{translations("admin.users.ban.dialog.title")}</DialogTitle>
					<DialogDescription>
						{translations("admin.users.ban.dialog.description", {
							name: user?.name ?? user?.email ?? "",
						})}
					</DialogDescription>
				</DialogHeader>

				<Form form={form}>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
						className="space-y-4"
					>
						<FormField name="banReason">
							{(field) => (
								<FormItem>
									<FormLabel>{translations("admin.users.ban.fields.reason")}</FormLabel>
									<FormControl>
										<Textarea
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

						<FormField name="expirationDate">
							{(field) => (
								<FormItem>
									<FormLabel>{translations("admin.users.ban.fields.expiration")}</FormLabel>
									<FormControl>
										<Input
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
											type="date"
											min={today}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						</FormField>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								{translations("common.confirmation.cancel")}
							</Button>
							<Button type="submit" variant="primary" loading={isSubmitting}>
								{isSubmitting
									? translations("admin.users.ban.actions.banning")
									: translations("admin.users.ban.actions.confirmBan")}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
