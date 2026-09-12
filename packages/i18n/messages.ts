import { toMerged } from "es-toolkit";
import { createTranslator } from "use-intl/core";

import { config, type Locale } from "./config";
import type { TranslationScope } from "./lib/get-messages";
import { normalizeLocale } from "./shared";
import enAccount from "./translations/en/account.json";
import enMail from "./translations/en/mail.json";
import enMarketing from "./translations/en/marketing.json";
import enRelay from "./translations/en/relay.json";
import enShared from "./translations/en/shared.json";
import enStudio from "./translations/en/studio.json";
import zhAccount from "./translations/zh/account.json";
import zhMail from "./translations/zh/mail.json";
import zhMarketing from "./translations/zh/marketing.json";
import zhRelay from "./translations/zh/relay.json";
import zhShared from "./translations/zh/shared.json";
import zhStudio from "./translations/zh/studio.json";

type Messages = Record<string, unknown>;

const scopedMessages = {
	en: {
		account: enAccount,
		mail: enMail,
		marketing: enMarketing,
		relay: enRelay,
		studio: enStudio,
		shared: enShared,
	},
	zh: {
		account: zhAccount,
		mail: zhMail,
		marketing: zhMarketing,
		relay: zhRelay,
		studio: zhStudio,
		shared: zhShared,
	},
} as const satisfies Record<Locale, Record<TranslationScope | "shared", Messages>>;

function mergeScope(locale: Locale, scope: TranslationScope): Messages {
	const localeMessages = scopedMessages[locale][scope];
	const sharedMessages = scopedMessages[locale].shared;
	let messages = toMerged(localeMessages, sharedMessages) as Messages;

	if (locale !== config.defaultLocale) {
		const defaultLocale = config.defaultLocale;
		const defaultMessages = toMerged(
			scopedMessages[defaultLocale][scope],
			scopedMessages[defaultLocale].shared,
		) as Messages;
		messages = toMerged(defaultMessages, messages) as Messages;
	}

	return messages;
}

export function getMessagesForLocaleSync<T = Messages>(locale: string, scope: TranslationScope): T {
	return mergeScope(normalizeLocale(locale), scope) as T;
}

export function createTranslatorForLocale(locale: string, scope: TranslationScope) {
	const resolvedLocale = normalizeLocale(locale);
	const translator = createTranslator({
		locale: resolvedLocale,
		messages: getMessagesForLocaleSync(resolvedLocale, scope),
	});

	return (key: string, values?: Record<string, unknown>) =>
		translator(key as never, values as never) as string;
}
