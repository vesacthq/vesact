import { useSession } from "@auth/hooks/use-session";
import { authClient } from "@repo/auth/client";
import { Spinner } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { UserAvatar } from "@shared/components/UserAvatar";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { type HTMLAttributes, useState } from "react";
import { useDropzone } from "react-dropzone";

import { CropImageDialog } from "./CropImageDialog";

export function UserAvatarUpload({
	onSuccess,
	onError,
	onDelete,
	isDeleting,
	deleteLabel,
}: {
	onSuccess: () => void;
	onError: () => void;
	onDelete?: () => void;
	isDeleting?: boolean;
	deleteLabel?: string;
}) {
	const { user, reloadSession } = useSession();
	const [uploading, setUploading] = useState(false);
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [image, setImage] = useState<File | null>(null);

	const getSignedUploadUrlMutation = useMutation(orpc.users.avatarUploadUrl.mutationOptions());

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			setImage(acceptedFiles[0]);
			setCropDialogOpen(true);
		},
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpg", ".jpeg"],
		},
		multiple: false,
	});

	if (!user) {
		return null;
	}
	const onCrop = async (croppedImageData: Blob | null) => {
		if (!croppedImageData) {
			return;
		}

		setUploading(true);
		try {
			const { signedUploadUrl, path } = await getSignedUploadUrlMutation.mutateAsync({});

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

			const { error } = await authClient.updateUser({
				image: path,
			});

			if (error) {
				throw error;
			}

			await reloadSession();

			onSuccess();
		} catch {
			onError();
		} finally {
			setUploading(false);
		}
	};

	return (
		<>
			<div
				className="size-24 relative rounded-full"
				{...(getRootProps() as HTMLAttributes<HTMLDivElement>)}
			>
				<input {...getInputProps()} />
				<UserAvatar
					className="size-24 text-xl cursor-pointer"
					avatarUrl={user.image}
					name={user.name ?? ""}
				/>

				{uploading && (
					<div className="inset-0 absolute z-20 flex items-center justify-center bg-card/90">
						<Spinner className="size-6" />
					</div>
				)}

				{user.image && onDelete && (
					<Button
						variant="secondary"
						size="icon"
						className="bottom-0 right-0 size-7 shadow-sm absolute z-10"
						aria-label={deleteLabel}
						disabled={isDeleting || uploading}
						onClick={(event) => {
							event.stopPropagation();
							onDelete();
						}}
					>
						{isDeleting ? <Spinner className="size-3.5" /> : <TrashIcon className="size-3.5" />}
					</Button>
				)}
			</div>

			<CropImageDialog
				image={image}
				open={cropDialogOpen}
				onOpenChange={setCropDialogOpen}
				onCrop={onCrop}
			/>
		</>
	);
}
