import { CheckoutReturnContent } from "@payments/components/CheckoutReturnContent";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const checkoutReturnSearch = z.object({
	organizationId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/checkout-return/")({
	validateSearch: (search) => checkoutReturnSearch.parse(search),
	component: CheckoutReturnPage,
	head: () => ({ meta: [{ title: documentTitle("Checkout") }] }),
});

function CheckoutReturnPage() {
	const { organizationId } = Route.useSearch();
	return (
		<div className="max-w-md p-6 mx-auto">
			<CheckoutReturnContent organizationId={organizationId} />
		</div>
	);
}
