import { useSession } from "@auth/hooks/use-session";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { posthog, startAnalytics } from "@shared/lib/analytics";
import { useEffect, useState } from "react";

export function Analytics() {
	const { user } = useSession();
	const { activeOrganization } = useActiveOrganization();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		let active = true;
		void startAnalytics().then(() => {
			if (active) {
				setReady(true);
			}
		});
		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!ready) {
			return;
		}
		if (user) {
			posthog()?.identify(user.id);
		} else {
			posthog()?.reset();
		}
	}, [ready, user]);

	useEffect(() => {
		if (!ready || !activeOrganization) {
			return;
		}
		posthog()?.group("organization", activeOrganization.id);
	}, [ready, activeOrganization]);

	return null;
}
