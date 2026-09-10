import { useTranslations } from "@i18n/intl";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * After checkout redirects the user back to the app, wait briefly for the
 * webhook to finalize the purchase. Most providers deliver the confirmation
 * event in under a couple of seconds.
 */
const MAX_WAIT_MS = 30_000;
const POLL_INTERVAL_MS = 2_000;

type ReturnState = "polling" | "timed-out";

export function CheckoutReturnContent({
	organizationId,
	organizationSlug,
}: {
	organizationId: string;
	organizationSlug: string;
}) {
	const t = useTranslations("checkoutReturn");
	const router = useRouter();
	const [state, setState] = useState<ReturnState>("polling");

	const { data, refetch } = useQuery({
		...orpc.payments.listPurchases.queryOptions({
			input: { organizationId },
		}),
		refetchInterval: state === "polling" ? POLL_INTERVAL_MS : false,
	});

	const purchases = data ?? [];
	const { activePlan } = createPurchasesHelper(purchases);

	const goToBilling = () =>
		router.navigate({
			to: "/orgs/$organizationSlug/billing",
			params: { organizationSlug },
			replace: true,
		});

	useEffect(() => {
		if (activePlan && activePlan.id !== "free") {
			void goToBilling();
		}
	}, [activePlan]); // oxlint-disable-line eslint-plugin-react-hooks/exhaustive-deps

	useEffect(() => {
		if (state !== "polling") {
			return;
		}
		const timer = setTimeout(() => {
			setState("timed-out");
		}, MAX_WAIT_MS);
		return () => clearTimeout(timer);
	}, [state]);

	if (state === "timed-out") {
		return (
			<div className="gap-4 py-8 flex flex-col items-center justify-center text-center">
				<p className="text-sm text-muted-foreground">{t("timeout")}</p>
				<div className="gap-2 flex">
					<Button
						variant="secondary"
						onClick={() => {
							setState("polling");
							void refetch();
						}}
					>
						{t("retry")}
					</Button>
					<Button variant="default" onClick={() => void goToBilling()}>
						{t("backToBilling")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="gap-4 py-8 flex flex-col items-center justify-center">
			<Spinner className="size-8" />
			<p className="text-sm text-center text-muted-foreground">{t("loading")}</p>
		</div>
	);
}
