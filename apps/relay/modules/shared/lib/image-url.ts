import { accountCenterUrl } from "@auth/lib/account-urls";
import { config as storageConfig } from "@repo/storage/config";

/**
 * Avatars and logos are uploaded in the account center, whose image proxy is
 * the only place that can sign a URL for them: Relay has no bucket credentials.
 */
export function imageUrl(pathOrUrl: string): string {
	return pathOrUrl.startsWith("http")
		? pathOrUrl
		: accountCenterUrl(`/image-proxy/${storageConfig.bucketNames.avatars}/${pathOrUrl}`);
}
