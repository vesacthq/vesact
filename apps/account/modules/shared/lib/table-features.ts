import {
	columnVisibilityFeature,
	createPaginatedRowModel,
	rowPaginationFeature,
	tableFeatures,
} from "@tanstack/react-table";

export const manualPaginationTableFeatures = tableFeatures({
	columnVisibilityFeature,
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
});
