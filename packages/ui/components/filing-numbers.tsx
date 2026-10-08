import { basePath } from "@repo/utils";

import { cn } from "../lib";

/**
 * The ICP filing number (linked to MIIT) and the public-security filing number with its
 * badge (linked to that filing's page on beian.mps.gov.cn), side by side at the bottom of
 * a page, as Tencent Cloud's filing rules require. The badge is `public/beian-mps.png` in
 * the app; only the domestic build sets the numbers, so elsewhere this renders nothing.
 */
export function FilingNumbers({
	icp,
	publicSecurity,
	className,
	linkClassName,
}: {
	icp?: string;
	publicSecurity?: string;
	className?: string;
	linkClassName?: string;
}) {
	if (!icp && !publicSecurity) {
		return null;
	}

	const publicSecurityCode = publicSecurity?.match(/\d+/)?.[0];

	return (
		<span className={cn("gap-x-4 gap-y-1 inline-flex flex-wrap items-center", className)}>
			{icp && (
				<a
					href="https://beian.miit.gov.cn/"
					target="_blank"
					rel="noreferrer"
					className={linkClassName}
				>
					{icp}
				</a>
			)}
			{publicSecurity && publicSecurityCode && (
				<a
					href={`https://beian.mps.gov.cn/#/query/webSearch?code=${publicSecurityCode}`}
					target="_blank"
					rel="noreferrer"
					className={cn("gap-1 inline-flex items-center", linkClassName)}
				>
					<img src={`${basePath}/beian-mps.png`} alt="" width={14} height={16} />
					{publicSecurity}
				</a>
			)}
		</span>
	);
}
