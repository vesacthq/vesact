import { useApiKeysQuery, useRevokeApiKeyMutation } from "@api-keys/lib/api";
import { useFormatter, useTranslations } from "@i18n/intl";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/reui/badge";
import {
	Frame,
	FrameDescription,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@repo/ui/components/reui/frame";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { toast } from "@repo/ui/components/toast";
import { useConfirmationAlert } from "@shared/components/ConfirmationAlertProvider";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Fragment, useState } from "react";

import { CreateApiKeyDialog } from "./CreateApiKeyDialog";

type ApiKeyItem = NonNullable<ReturnType<typeof useApiKeysQuery>["data"]>[number];

export function ApiKeysBlock({ organizationId }: { organizationId: string }) {
	const t = useTranslations();
	const formatter = useFormatter();
	const { confirm } = useConfirmationAlert();
	const { data: apiKeys, isPending, isError } = useApiKeysQuery(organizationId);
	const revokeApiKey = useRevokeApiKeyMutation(organizationId);
	const [createOpen, setCreateOpen] = useState(false);

	const revoke = (apiKey: ApiKeyItem) => {
		confirm({
			title: t("apiKeys.revoke.title"),
			message: t("apiKeys.revoke.message", { name: apiKey.name ?? apiKey.start ?? "" }),
			confirmLabel: t("apiKeys.revoke.confirm"),
			destructive: true,
			onConfirm: () =>
				toast
					.promise(revokeApiKey.mutateAsync({ keyId: apiKey.id }), {
						loading: { title: t("apiKeys.revoke.loading") },
						success: { title: t("apiKeys.revoke.success") },
						error: { title: t("apiKeys.revoke.error") },
					})
					.catch(() => undefined),
		});
	};

	return (
		<>
			<Frame stacked spacing="sm">
				<FrameHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0 gap-0.5 flex flex-col">
						<FrameTitle>{t("apiKeys.list.title")}</FrameTitle>
						<FrameDescription>{t("apiKeys.list.description")}</FrameDescription>
					</div>
					<Button size="sm" className="shrink-0" onClick={() => setCreateOpen(true)}>
						<PlusIcon className="size-4" aria-hidden="true" />
						{t("apiKeys.create.button")}
					</Button>
				</FrameHeader>
				<FramePanel className="p-0">
					{isPending ? (
						<div className="gap-2 p-4 flex flex-col">
							<Skeleton className="h-5 w-1/3" />
							<Skeleton className="h-4 w-2/3" />
						</div>
					) : isError ? (
						<p className="p-8 text-sm text-center text-destructive">{t("apiKeys.list.error")}</p>
					) : !apiKeys?.length ? (
						<p className="p-8 text-sm text-center text-muted-foreground">
							{t("apiKeys.list.empty")}
						</p>
					) : (
						apiKeys.map((apiKey, index) => (
							<Fragment key={apiKey.id}>
								{index > 0 && <Separator />}
								<div className="gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center grid">
									<div className="min-w-0 gap-1 flex flex-col">
										<div className="gap-2 flex flex-wrap items-center">
											<span className="text-sm font-medium truncate">{apiKey.name}</span>
											{!apiKey.enabled && (
												<Badge variant="destructive-light" size="xs">
													{t("apiKeys.list.disabled")}
												</Badge>
											)}
										</div>
										<div className="gap-x-3 gap-y-1 text-xs flex flex-wrap items-center text-muted-foreground">
											<code className="font-mono">{apiKey.start}…</code>
											<span>
												{t("apiKeys.list.created", {
													date: formatter.dateTime(new Date(apiKey.createdAt), {
														dateStyle: "medium",
													}),
												})}
											</span>
											<span>
												{apiKey.lastRequest
													? t("apiKeys.list.lastUsed", {
															date: formatter.dateTime(new Date(apiKey.lastRequest), {
																dateStyle: "medium",
																timeStyle: "short",
															}),
														})
													: t("apiKeys.list.neverUsed")}
											</span>
										</div>
									</div>
									<Button variant="ghost" size="sm" onClick={() => revoke(apiKey)}>
										<Trash2Icon className="size-4" aria-hidden="true" />
										{t("apiKeys.list.revoke")}
									</Button>
								</div>
							</Fragment>
						))
					)}
				</FramePanel>
			</Frame>
			<CreateApiKeyDialog
				organizationId={organizationId}
				open={createOpen}
				onOpenChange={setCreateOpen}
			/>
		</>
	);
}
