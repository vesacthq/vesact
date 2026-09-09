import { listPurchases as listPurchasesProcedure } from "@repo/api/modules/payments/procedures/list-purchases";
import { getRequestHeaders } from "@tanstack/react-start/server";

export async function listPurchases(organizationId?: string) {
	const purchases = await listPurchasesProcedure.callable({
		context: { headers: getRequestHeaders() },
	})({
		organizationId,
	});

	return purchases;
}
