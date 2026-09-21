import type { Locale } from "@repo/i18n";
import { config as i18nConfig } from "@repo/i18n";

import type { WwwI18nConfig } from "./types";

export const config: WwwI18nConfig = i18nConfig;
export type { Locale };
