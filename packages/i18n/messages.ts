import { toMerged } from "es-toolkit";
import { createTranslator } from "use-intl/core";

import { config, type Locale } from "./config";
import type { TranslationScope } from "./lib/get-messages";
import { normalizeLocale } from "./shared";
import deAuth from "./translations/de/auth.json";
import deMail from "./translations/de/mail.json";
import deMarketing from "./translations/de/marketing.json";
import deShared from "./translations/de/shared.json";
import deStudio from "./translations/de/studio.json";
import enAuth from "./translations/en/auth.json";
import enMail from "./translations/en/mail.json";
import enMarketing from "./translations/en/marketing.json";
import enShared from "./translations/en/shared.json";
import enStudio from "./translations/en/studio.json";
import esAuth from "./translations/es/auth.json";
import esMail from "./translations/es/mail.json";
import esMarketing from "./translations/es/marketing.json";
import esShared from "./translations/es/shared.json";
import esStudio from "./translations/es/studio.json";
import frAuth from "./translations/fr/auth.json";
import frMail from "./translations/fr/mail.json";
import frMarketing from "./translations/fr/marketing.json";
import frShared from "./translations/fr/shared.json";
import frStudio from "./translations/fr/studio.json";
import zhAuth from "./translations/zh/auth.json";
import zhMail from "./translations/zh/mail.json";
import zhMarketing from "./translations/zh/marketing.json";
import zhShared from "./translations/zh/shared.json";
import zhStudio from "./translations/zh/studio.json";

type Messages = Record<string, unknown>;

const scopedMessages = {
	en: {
		auth: enAuth,
		mail: enMail,
		marketing: enMarketing,
		studio: enStudio,
		shared: enShared,
	},
	de: {
		auth: deAuth,
		mail: deMail,
		marketing: deMarketing,
		studio: deStudio,
		shared: deShared,
	},
	es: {
		auth: esAuth,
		mail: esMail,
		marketing: esMarketing,
		studio: esStudio,
		shared: esShared,
	},
	fr: {
		auth: frAuth,
		mail: frMail,
		marketing: frMarketing,
		studio: frStudio,
		shared: frShared,
	},
	zh: {
		auth: zhAuth,
		mail: zhMail,
		marketing: zhMarketing,
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
