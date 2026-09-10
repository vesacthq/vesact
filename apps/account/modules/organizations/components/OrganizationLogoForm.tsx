import { useTranslations } from "@i18n/intl";
import { useOrganization } from "@organizations/hooks/use-organization";
import { authClient } from "@repo/auth/client";
import { Spinner } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { type HTMLAttributes, useState } from "react";
import { useDropzone } from "react-dropzone";

import { CropImageDialog } from "../../account/components/CropImageDialog";
import { OrganizationLogo } from "./OrganizationLogo";

export function OrganizationLogoForm({ disabled }: { disabled?: boolean }) {
	const t = useTranslations();
	const [isSaving, setIsSaving] = useState(false);
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const { organization: activeOrganization, refetch } = useOrganization();
	const getSignedUploadUrlMutation = useMutation(
		orpc.organizations.createLogoUploadUrl.mutationOptions(),
	);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			setImage(acceptedFiles[0]);
			setCropDialogOpen(true);
		},
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpg", ".jpeg"],
		},
		disabled: isSaving || disabled,
		multiple: false,
	});

	const onCrop = async (croppedImageData: Blob | null) => {
		if (!croppedImageData) {
			return;
		}

		setIsSaving(true);
		try {
			const { signedUploadUrl, path } = await getSignedUploadUrlMutation.mutateAsync({
				organizationId: activeOrganization.id,
			});

			const response = await fetch(signedUploadUrl, {
				method: "PUT",
				body: croppedImageData,
				headers: {
					"Content-Type": "image/png",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const { error } = await authClient.organization.update({
				organizationId: activeOrganization.id,
				data: {
					logo: path,
				},
			});

			if (error) {
				throw error;
			}

			toast.add({
				title: t("organizations.settings.logo.notifications.success"),
				type: "success",
			});

			await refetch();
		} catch {
			toast.add({
				title: t("organizations.settings.logo.notifications.error"),
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const deleteLogo = async () => {
		if (!activeOrganization.logo) {
			return;
		}

		setIsSaving(true);
		try {
			const { error } = await authClient.organization.update({
				organizationId: activeOrganization.id,
				data: {
					logo: "",
				},
			});

			if (error) {
				throw error;
			}

			toast.add({
				title: t("organizations.settings.logo.notifications.success"),
				type: "success",
			});

			await refetch();
		} catch {
			toast.add({
				title: t("organizations.settings.logo.notifications.error"),
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SettingsItem
			title={t("organizations.settings.logo.title")}
			description={t("organizations.settings.logo.description")}
		>
			<div
				className="size-24 relative rounded-full"
				{...(getRootProps() as HTMLAttributes<HTMLDivElement>)}
			>
				<input {...getInputProps()} />
				<OrganizationLogo
					className="size-24 text-xl cursor-pointer"
					logoUrl={activeOrganization.logo}
					name={activeOrganization.name ?? ""}
				/>

				{isSaving && (
					<div className="inset-0 absolute z-20 flex items-center justify-center bg-card/90">
						<Spinner />
					</div>
				)}

				{activeOrganization.logo && !disabled && (
					<Button
						variant="secondary"
						size="icon"
						className="bottom-0 right-0 size-7 shadow-sm absolute z-10"
						aria-label={t("organizations.settings.logo.delete")}
						disabled={isSaving}
						onClick={(event) => {
							event.stopPropagation();
							void deleteLogo();
						}}
					>
						{isSaving ? <Spinner className="size-3.5" /> : <TrashIcon className="size-3.5" />}
					</Button>
				)}
			</div>

			<CropImageDialog
				image={image}
				open={cropDialogOpen}
				onOpenChange={setCropDialogOpen}
				onCrop={onCrop}
			/>
		</SettingsItem>
	);
}
