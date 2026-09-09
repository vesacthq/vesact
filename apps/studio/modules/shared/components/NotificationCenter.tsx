import { useSession } from "@auth/hooks/use-session";
import { useFormatter, useTranslations } from "@i18n/intl";
import { Button, cn } from "@repo/ui";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Spinner } from "@repo/ui/components/spinner";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { BellIcon } from "lucide-react";
import { useMemo, useState } from "react";

function parseDate(value: Date | string): Date {
	return value instanceof Date ? value : new Date(value);
}

export function NotificationCenter({ className }: { className?: string }) {
	const t = useTranslations("app.notifications");
	const format = useFormatter();
	const { user } = useSession();
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const { data, isLoading, refetch } = useQuery({
		...orpc.notifications.list.queryOptions({
			input: { limit: 20 },
		}),
		enabled: Boolean(user),
		refetchInterval: open ? false : 60_000,
	});

	const markRead = useMutation({
		...orpc.notifications.markAsRead.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: orpc.notifications.list.key() });
		},
	});

	const markAllRead = useMutation({
		...orpc.notifications.markAllAsRead.mutationOptions(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: orpc.notifications.list.key() });
		},
	});

	const unreadCount = data?.unreadCount ?? 0;

	const orderedItems = useMemo(
		() =>
			[...(data?.items ?? [])].sort(
				(a, b) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime(),
			),
		[data?.items],
	);

	const onItemActivate = async (n: {
		id: string;
		readAt: Date | string | null;
		link: string | null;
	}) => {
		if (n.readAt == null) {
			await markRead.mutateAsync({ notificationId: n.id });
		}
		if (n.link?.startsWith("/")) {
			void router.navigate({ to: n.link });
		}
		setOpen(false);
	};

	if (!user) {
		return null;
	}

	return (
		<DropdownMenu
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) {
					void refetch();
				}
			}}
		>
			<DropdownMenuTrigger
				render={
					<Button
						type="button"
						variant="outline"
						size="icon"
						className={cn("relative", className)}
						aria-label={t("aria.open")}
					>
						<BellIcon className="size-4 text-muted-foreground" />
						{unreadCount > 0 ? (
							<span className="-right-1.5 -top-1.5 h-5 min-w-5 px-1 font-semibold absolute flex items-center justify-center rounded-full bg-primary text-[10px] leading-none text-primary-foreground">
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						) : null}
					</Button>
				}
			/>
			<DropdownMenuContent className="p-0 w-[min(100vw-2rem,22rem)]" align="end">
				<div className="gap-2 px-3 py-2 flex items-center justify-between border-b">
					<div className="min-w-0 flex-1">
						<h2 className="font-semibold text-sm">{t("title")}</h2>
						<p className="text-xs truncate text-muted-foreground">
							{unreadCount === 0
								? t("unreadNone")
								: unreadCount === 1
									? t("unreadOne")
									: t("unreadMany", { count: unreadCount })}
						</p>
					</div>
					{unreadCount > 0 ? (
						<Button
							variant="ghost"
							size="sm"
							className="h-8 text-xs shrink-0"
							disabled={markAllRead.isPending}
							onClick={() => void markAllRead.mutateAsync(undefined)}
						>
							{markAllRead.isPending && <Spinner data-icon="inline-start" />}
							{t("markAllAsRead")}
						</Button>
					) : null}
				</div>
				<div className="max-h-80 px-1 py-2 overflow-y-auto">
					{isLoading ? (
						<p className="px-3 py-6 text-sm text-center text-muted-foreground">…</p>
					) : orderedItems.length === 0 ? (
						<p className="px-3 py-6 text-sm text-center text-muted-foreground">{t("empty")}</p>
					) : (
						<ul className="space-y-0.5">
							{orderedItems.map((n) => {
								const created = parseDate(n.createdAt);
								const isUnread = n.readAt == null;
								const timeLabel = format.dateTime(created, {
									dateStyle: "medium",
									timeStyle: "short",
								});
								return (
									<li key={n.id}>
										<button
											type="button"
											className={cn(
												"px-3 py-2 text-sm w-full rounded-md text-left transition-colors",
												"hover:bg-muted",
												isUnread && "bg-muted/40",
											)}
											onClick={() => void onItemActivate(n)}
										>
											<NotificationRowBody
												title={n.title}
												body={n.body}
												timeLabel={timeLabel}
												unread={isUnread}
											/>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function NotificationRowBody({
	title,
	body,
	timeLabel,
	unread,
}: {
	title: string;
	body: string;
	timeLabel: string;
	unread: boolean;
}) {
	return (
		<div className="gap-2 flex">
			<div className="min-w-0 flex-1">
				<div className="gap-2 flex items-start">
					{unread ? (
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
					) : (
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0" aria-hidden />
					)}
					<span className="font-medium line-clamp-1">{title}</span>
				</div>
				<p className="text-xs line-clamp-2 text-muted-foreground">{body}</p>
				<p className="mt-0.5 text-[0.7rem] text-muted-foreground">{timeLabel}</p>
			</div>
		</div>
	);
}
