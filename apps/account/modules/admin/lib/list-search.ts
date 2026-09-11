export interface AdminListSearch {
	page?: number;
	query?: string;
}

// Both keys are omitted at their defaults so a plain list URL stays clean.
export function validateAdminListSearch(search: Record<string, unknown>): AdminListSearch {
	const page = Number(search.page);
	const query = typeof search.query === "string" ? search.query : "";

	return {
		page: Number.isInteger(page) && page > 1 ? page : undefined,
		query: query || undefined,
	};
}
