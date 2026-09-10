import { CheckoutReturnContent } from "@payments/components/CheckoutReturnContent";
import { AuthWrapper } from "@shared/components/AuthWrapper";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const checkoutReturnSearch = z.object({
	organizationId: z.string(),
	organizationSlug: z.string(),
});

export const Route = createFileRoute("/_authenticated/checkout-return/")({
	validateSearch: (search) => checkoutReturnSearch.parse(search),
	component: CheckoutReturnPage,
	head: () => ({ meta: [{ title: documentTitle("Checkout") }] }),
});

function CheckoutReturnPage() {
	const { organizationId, organizationSlug } = Route.useSearch();

	return (
		<AuthWrapper>
			<CheckoutReturnContent organizationId={organizationId} organizationSlug={organizationSlug} />
		</AuthWrapper>
	);
}
