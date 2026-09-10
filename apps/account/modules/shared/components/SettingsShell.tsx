import type { PropsWithChildren } from "react";

import { AccountHeader } from "./AccountHeader";
import { SettingsNav } from "./SettingsNav";

export function SettingsShell({ children }: PropsWithChildren) {
	return (
		<div className="py-6 flex min-h-screen w-full flex-col">
			<AccountHeader />
			<div className="mt-8 gap-8 md:grid-cols-[13.5rem_minmax(0,1fr)] container grid">
				<SettingsNav />
				<main className="max-w-4xl min-w-0">{children}</main>
			</div>
		</div>
	);
}
