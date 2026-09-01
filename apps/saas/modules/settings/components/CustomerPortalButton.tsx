import { useTranslations } from "@i18n/intl";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { toast } from "@repo/ui/components/toast";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { CreditCardIcon } from "lucide-react";

export function CustomerPortalButton({ purchaseId }: { purchaseId: string }) {
	const t = useTranslations();
	const createCustomerPortalMutation = useMutation(
		orpc.payments.createCustomerPortalLink.mutationOptions(),
	);

	const createCustomerPortal = async () => {
		try {
			const { customerPortalLink } = await createCustomerPortalMutation.mutateAsync({
				purchaseId,
				redirectUrl: window.location.href,
			});

			window.location.href = customerPortalLink;
		} catch {
			toast.add({
				title: t("settings.billing.createCustomerPortal.notifications.error.title"),
				type: "error",
			});
		}
	};

	return (
		<Button
			variant="secondary"
			size="sm"
			onClick={() => createCustomerPortal()}
			disabled={createCustomerPortalMutation.isPending}
		>
			{createCustomerPortalMutation.isPending ? (
				<Spinner data-icon="inline-start" />
			) : (
				<CreditCardIcon data-icon="inline-start" />
			)}
			{t("settings.billing.createCustomerPortal.label")}
		</Button>
	);
}
