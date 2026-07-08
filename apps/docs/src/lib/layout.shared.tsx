import { Logo } from "@repo/ui";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { docsSiteTitle, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<span className="gap-3 flex items-center">
					<Logo withLabel={false} className="[&_svg]:size-8 text-fd-primary shrink-0" />
					<span className="font-semibold text-base text-fd-foreground">{docsSiteTitle}</span>
				</span>
			),
		},
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
	};
}
