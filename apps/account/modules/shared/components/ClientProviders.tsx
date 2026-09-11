import { ProgressProvider, useProgress } from "@bprogress/react";
import { useRouterState } from "@tanstack/react-router";
import { type PropsWithChildren, useEffect } from "react";

function RouterProgress() {
	const { start, stop } = useProgress();
	const pending = useRouterState({ select: (state) => state.status === "pending" });

	useEffect(() => {
		if (pending) {
			start();
		} else {
			stop();
		}
	}, [pending, start, stop]);

	return null;
}

export function ClientProviders({ children }: PropsWithChildren) {
	return (
		<ProgressProvider
			height="4px"
			color="var(--color-primary)"
			options={{ showSpinner: false }}
			shallowRouting
			delay={250}
		>
			<RouterProgress />
			{children}
		</ProgressProvider>
	);
}
