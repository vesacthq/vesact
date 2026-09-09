import { useSession } from "@auth/hooks/use-session";
import { useActiveOrganization } from "@organizations/hooks/use-active-organization";
import { identifyUser, setOrganization, startAnalytics } from "@repo/analytics";
import { useEffect } from "react";

export function Analytics() {
	const { user } = useSession();
	const { activeOrganization } = useActiveOrganization();

	useEffect(() => {
		startAnalytics({
			product: "studio",
			key: import.meta.env.VITE_POSTHOG_KEY as string | undefined,
			host: import.meta.env.VITE_POSTHOG_HOST as string | undefined,
			appUrl: import.meta.env.VITE_STUDIO_URL as string | undefined,
			enabled: import.meta.env.PROD,
		});
	}, []);

	useEffect(() => {
		identifyUser(user?.id ?? null);
	}, [user]);

	useEffect(() => {
		setOrganization(activeOrganization?.id ?? null);
	}, [activeOrganization]);

	return null;
}
