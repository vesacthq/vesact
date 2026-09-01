import { usePlanData } from "@payments/hooks/plan-data";
import { usePurchases } from "@payments/hooks/purchases";
import { Badge } from "@repo/ui/components/badge";

export function ActivePlanBadge({ organizationId }: { organizationId?: string }) {
	const { planData } = usePlanData();
	const { activePlan } = usePurchases(organizationId);

	if (!activePlan) {
		return null;
	}

	const activePlanData = planData[activePlan.id as keyof typeof planData];

	if (!activePlanData) {
		return null;
	}
	return <Badge className="px-1.5 bg-touch/10 text-touch">{activePlanData.title}</Badge>;
}
