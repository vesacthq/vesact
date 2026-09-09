import { createQueryClient } from "./query-client";

export function getServerQueryClient() {
	return createQueryClient();
}
