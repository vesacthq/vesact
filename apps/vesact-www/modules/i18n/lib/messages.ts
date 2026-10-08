import type { VesactWwwMessages } from "@repo/i18n";
import { getMessagesForLocale as getMessages } from "@repo/i18n";

export const getMessagesForLocale = async (locale: string): Promise<VesactWwwMessages> => {
	return getMessages(locale as Parameters<typeof getMessages>[0], "vesact-www");
};
