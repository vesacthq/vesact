import { useTranslations } from "@i18n/intl";
import { OrganizationLogo } from "@organizations/components/OrganizationLogo";
import { organizationListQueryKey } from "@organizations/lib/api";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@repo/ui/components/table";
import { toast } from "@repo/ui/components/toast";
import { useConfirmationAlert } from "@shared/components/ConfirmationAlertProvider";
import { Pagination } from "@shared/components/Pagination";
import { orpcClient } from "@shared/lib/orpc-client";
import { orpc } from "@shared/lib/orpc-query-utils";
import { manualPaginationTableFeatures } from "@shared/lib/table-features";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender, useTable } from "@tanstack/react-table";
import { EditIcon, MoreVerticalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDebounceValue } from "usehooks-ts";

const ITEMS_PER_PAGE = 10;
const route = getRouteApi("/_authenticated/_settings/admin/organizations/");

export function OrganizationList() {
	const t = useTranslations();
	const { confirm } = useConfirmationAlert();
	const queryClient = useQueryClient();
	const { page: currentPage = 1, query: searchTerm = "" } = route.useSearch();
	const navigate = route.useNavigate();
	const setCurrentPage = useCallback(
		(page: number) =>
			navigate({
				search: (prev) => ({ ...prev, page: page > 1 ? page : undefined }),
				replace: true,
			}),
		[navigate],
	);
	const setSearchTerm = useCallback(
		(query: string) =>
			navigate({ search: (prev) => ({ ...prev, query: query || undefined }), replace: true }),
		[navigate],
	);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounceValue(searchTerm, 300, {
		leading: true,
		trailing: false,
	});

	const previousSearchTermRef = useRef(debouncedSearchTerm);

	useEffect(() => {
		setDebouncedSearchTerm(searchTerm);
	}, [searchTerm]); // oxlint-disable-line eslint-plugin-react-hooks/exhaustive-deps

	const { data, isLoading } = useQuery(
		orpc.admin.organizations.list.queryOptions({
			input: {
				limit: ITEMS_PER_PAGE,
				offset: (currentPage - 1) * ITEMS_PER_PAGE,
				query: debouncedSearchTerm,
			},
		}),
	);

	useEffect(() => {
		if (
			previousSearchTermRef.current !== debouncedSearchTerm &&
			previousSearchTermRef.current !== undefined
		) {
			void setCurrentPage(1);
		}
		previousSearchTermRef.current = debouncedSearchTerm;
	}, [debouncedSearchTerm, setCurrentPage]);

	const deleteOrganization = async (id: string) => {
		const removeOrganization = async () => {
			await orpcClient.admin.organizations.delete({ id });

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.admin.organizations.list.key(),
				}),
				queryClient.invalidateQueries({
					queryKey: organizationListQueryKey,
				}),
			]);
		};

		await toast
			.promise(removeOrganization(), {
				loading: { title: t("admin.organizations.deleteOrganization.deleting") },
				success: { title: t("admin.organizations.deleteOrganization.deleted") },
				error: { title: t("admin.organizations.deleteOrganization.notDeleted") },
			})
			.catch(() => undefined);
	};

	const columns: ColumnDef<
		typeof manualPaginationTableFeatures,
		NonNullable<typeof data>["organizations"][number]
	>[] = useMemo(
		() => [
			{
				accessorKey: "user",
				header: "",
				accessorFn: (row) => row.name,
				cell: ({
					row: {
						original: { id, name, logo, membersCount },
					},
				}) => (
					<div className="gap-2 flex items-center">
						<OrganizationLogo name={name} logoUrl={logo} />
						<div className="leading-tight">
							<Link
								to="/admin/organizations/$organizationId"
								params={{ organizationId: id }}
								search={true}
								className="font-bold block"
							>
								{name}
							</Link>
							<small>
								{t("admin.organizations.membersCount", {
									count: membersCount,
								})}
							</small>
						</div>
					</div>
				),
			},
			{
				accessorKey: "actions",
				header: "",
				cell: ({
					row: {
						original: { id },
					},
				}) => {
					return (
						<div className="gap-2 flex flex-row justify-end">
							<DropdownMenu>
								<DropdownMenuTrigger
									render={(props) => (
										<Button {...props} size="icon" variant="ghost">
											<MoreVerticalIcon className="size-4" />
										</Button>
									)}
								/>
								<DropdownMenuContent>
									<DropdownMenuItem
										nativeButton={false}
										render={(props) => (
											<Link
												{...props}
												to="/admin/organizations/$organizationId"
												params={{ organizationId: id }}
												search={true}
												className={cn(props.className, "flex items-center")}
											>
												<EditIcon className="mr-2 size-4" />
												{t("admin.organizations.edit")}
											</Link>
										)}
									/>
									<DropdownMenuItem
										onClick={() =>
											confirm({
												title: t("admin.organizations.confirmDelete.title"),
												message: t("admin.organizations.confirmDelete.message"),
												confirmLabel: t("admin.organizations.confirmDelete.confirm"),
												destructive: true,
												onConfirm: () => deleteOrganization(id),
											})
										}
									>
										<TrashIcon className="size-4" />
										{t("admin.organizations.delete")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
			},
		],
		[], // oxlint-disable-line eslint-plugin-react-hooks/exhaustive-deps
	);

	const organizations = useMemo(() => data?.organizations ?? [], [data?.organizations]);

	const table = useTable({
		features: manualPaginationTableFeatures,
		data: organizations,
		columns,
		manualPagination: true,
	});

	return (
		<Card className="p-6">
			<div className="mb-4 gap-6 flex items-center justify-between">
				<h2 className="font-semibold text-2xl">{t("admin.organizations.title")}</h2>

				<Button
					variant="secondary"
					nativeButton={false}
					render={<Link to="/admin/organizations/new" search={true} />}
				>
					<PlusIcon className="mr-1.5 size-4" />
					{t("admin.organizations.create")}
				</Button>
			</div>
			<Input
				type="search"
				placeholder={t("admin.organizations.search")}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>

			<div className="rounded-md border">
				<Table>
					<TableBody>
						{isLoading ? (
							Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
								<TableRow key={`skeleton-${index}`}>
									<TableCell className="py-2">
										<div className="gap-2 flex items-center">
											<Skeleton className="size-10 rounded-md" />
											<div className="space-y-2 flex-1">
												<Skeleton className="h-4 w-32" />
												<Skeleton className="h-3 w-24" />
											</div>
										</div>
									</TableCell>
									<TableCell className="py-2">
										<div className="flex justify-end">
											<Skeleton className="size-9 rounded-md" />
										</div>
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="group">
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="py-2 group-first:rounded-t-md group-last:rounded-b-md"
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									<p>No results.</p>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{!!data?.total && data.total > ITEMS_PER_PAGE && (
				<Pagination
					className="mt-4"
					totalItems={data.total}
					itemsPerPage={ITEMS_PER_PAGE}
					currentPage={currentPage}
					onChangeCurrentPage={setCurrentPage}
				/>
			)}
		</Card>
	);
}
