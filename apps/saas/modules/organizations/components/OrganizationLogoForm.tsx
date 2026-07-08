import { useTranslations } from "@i18n/intl";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { organizationListQueryKey } from "@organizations/lib/api";
import { authClient } from "@repo/auth/client";
import { Spinner } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type HTMLAttributes, useState } from "react";
import { useDropzone } from "react-dropzone";

import { CropImageDialog } from "../../settings/components/CropImageDialog";
import { OrganizationLogo } from "./OrganizationLogo";

export function OrganizationLogoForm() {
	const t = useTranslations();
	const [isSaving, setIsSaving] = useState(false);
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const { activeOrganization, refetchActiveOrganization } = useActiveOrganization();
	const queryClient = useQueryClient();
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
		disabled: isSaving,
		multiple: false,
	});

	if (!activeOrganization) {
		return null;
	}

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

			toastSuccess(t("organizations.settings.logo.notifications.success"));

			await refetchActiveOrganization();

			await queryClient.invalidateQueries({
				queryKey: organizationListQueryKey,
			});
		} catch {
			toastError(t("organizations.settings.logo.notifications.error"));
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

			toastSuccess(t("organizations.settings.logo.notifications.success"));

			await refetchActiveOrganization();

			await queryClient.invalidateQueries({
				queryKey: organizationListQueryKey,
			});
		} catch {
			toastError(t("organizations.settings.logo.notifications.error"));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SettingsItem
			title={t("organizations.settings.logo.title")}
			description={t("organizations.settings.logo.description")}
		>
			<div className="gap-4 flex flex-col">
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
				</div>

				{activeOrganization.logo && (
					<div className="flex justify-end">
						<Button variant="outline" onClick={deleteLogo} loading={isSaving} disabled={isSaving}>
							{t("organizations.settings.logo.delete")}
						</Button>
					</div>
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
