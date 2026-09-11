import { config } from "@config";

export function documentTitle(pageTitle?: string | null) {
	if (!pageTitle) {
		return config.appName;
	}

	return `${pageTitle} – ${config.appName}`;
}
