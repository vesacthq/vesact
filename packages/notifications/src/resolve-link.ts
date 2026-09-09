import { getBaseUrl } from "@repo/utils";

export function resolveNotificationLink(link: string | null | undefined): string | null {
	if (link == null) {
		return null;
	}

	const trimmed = link.trim();

	if (trimmed.length === 0) {
		return null;
	}

	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	try {
		return new URL(trimmed, getBaseUrl(process.env.VITE_SAAS_URL, 3000)).href;
	} catch {
		return trimmed;
	}
}
