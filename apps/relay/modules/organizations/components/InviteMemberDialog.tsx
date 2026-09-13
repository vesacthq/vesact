import { useTranslations } from "@i18n/intl";
import {
	invitationLink,
	memberErrorKey,
	useInviteMemberMutation,
} from "@organizations/lib/members";
import { type OrganizationRole, organizationRoles } from "@organizations/lib/roles";
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
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { useForm, useStore } from "@tanstack/react-form";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { OrganizationRoleSelect } from "./OrganizationRoleSelect";

const formSchema = z.object({
	email: z.email(),
	role: z.enum(organizationRoles),
});

const defaultValues: z.infer<typeof formSchema> = { email: "", role: "member" };

export function InviteMemberDialog({
	organization,
	allowOwner,
	open,
	onOpenChange,
}: {
	organization: { id: string; slug: string };
	allowOwner: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const t = useTranslations();
	const inviteMember = useInviteMemberMutation(organization);
	const [created, setCreated] = useState<{ email: string; link: string } | null>(null);
	const [copied, setCopied] = useState(false);

	const form = useForm({
		defaultValues,
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			try {
				const invitation = await inviteMember.mutateAsync({
					email: value.email.trim().toLowerCase(),
					role: value.role,
				});
				setCreated({ email: invitation.email, link: invitationLink(invitation.id) });
			} catch (error) {
				const key = memberErrorKey(error);
				toast.add({
					title: key
						? t(`organizations.members.errors.${key}`)
						: t("organizations.invitations.create.error"),
					type: "error",
				});
			}
		},
	});
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	const setOpen = (nextOpen: boolean) => {
		if (!nextOpen && isSubmitting) {
			return;
		}

		onOpenChange(nextOpen);

		if (!nextOpen) {
			form.reset();
			setCreated(null);
			setCopied(false);
		}
	};

	const copy = async () => {
		if (created) {
			await navigator.clipboard.writeText(created.link);
			setCopied(true);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				{created ? (
					<>
						<DialogHeader>
							<DialogTitle>{t("organizations.invitations.created.title")}</DialogTitle>
							<DialogDescription>
								{t("organizations.invitations.created.description", { email: created.email })}
							</DialogDescription>
						</DialogHeader>
						<div className="gap-2 flex items-start">
							<code className="min-w-0 px-3 py-2 font-mono text-xs flex-1 rounded-md border bg-muted/40 break-all">
								{created.link}
							</code>
							<Button variant="outline" size="sm" className="shrink-0" onClick={copy}>
								{copied ? (
									<CheckIcon className="size-4" aria-hidden="true" />
								) : (
									<CopyIcon className="size-4" aria-hidden="true" />
								)}
								{copied
									? t("organizations.invitations.created.copied")
									: t("organizations.invitations.created.copy")}
							</Button>
						</div>
						<DialogFooter>
							<Button onClick={() => setOpen(false)}>
								{t("organizations.invitations.created.done")}
							</Button>
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
								<DialogTitle>{t("organizations.invitations.create.title")}</DialogTitle>
								<DialogDescription>
									{t("organizations.invitations.create.description")}
								</DialogDescription>
							</DialogHeader>
							<div className="gap-4 flex flex-col">
								<FormField name="email">
									{(field) => (
										<FormItem>
											<FormLabel>{t("organizations.invitations.create.email")}</FormLabel>
											<FormControl>
												<Input
													type="email"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(event) => field.handleChange(event.target.value)}
													placeholder={t("organizations.invitations.create.emailPlaceholder")}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								</FormField>
								<FormField name="role">
									{(field) => (
										<FormItem>
											<FormLabel>{t("organizations.invitations.create.role")}</FormLabel>
											<FormControl>
												<OrganizationRoleSelect
													value={field.state.value}
													allowOwner={allowOwner}
													onSelect={(role: OrganizationRole) => field.handleChange(role)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								</FormField>
							</div>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setOpen(false)}>
									{t("common.confirmation.cancel")}
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Spinner data-icon="inline-start" />}
									{t("organizations.invitations.create.submit")}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}
