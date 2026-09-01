import { toMerged } from "es-toolkit";
import { createTranslator } from "use-intl/core";

import { config, type Locale } from "./config";
import type { TranslationScope } from "./lib/get-messages";
import { normalizeLocale } from "./shared";
import deMail from "./translations/de/mail.json";
import deMarketing from "./translations/de/marketing.json";
import deSaas from "./translations/de/saas.json";
import deShared from "./translations/de/shared.json";
import enMail from "./translations/en/mail.json";
import enMarketing from "./translations/en/marketing.json";
import enSaas from "./translations/en/saas.json";
import enShared from "./translations/en/shared.json";
import esMail from "./translations/es/mail.json";
import esMarketing from "./translations/es/marketing.json";
import esSaas from "./translations/es/saas.json";
import esShared from "./translations/es/shared.json";
import frMail from "./translations/fr/mail.json";
import frMarketing from "./translations/fr/marketing.json";
import frSaas from "./translations/fr/saas.json";
import frShared from "./translations/fr/shared.json";
import zhMail from "./translations/zh/mail.json";
import zhMarketing from "./translations/zh/marketing.json";
import zhSaas from "./translations/zh/saas.json";
import zhShared from "./translations/zh/shared.json";

type Messages = Record<string, unknown>;

const scopedMessages = {
	en: {
		mail: enMail,
		marketing: enMarketing,
		saas: enSaas,
		shared: enShared,
	},
	de: {
		mail: deMail,
		marketing: deMarketing,
		saas: deSaas,
		shared: deShared,
	},
	es: {
		mail: esMail,
		marketing: esMarketing,
		saas: esSaas,
		shared: esShared,
	},
	fr: {
		mail: frMail,
		marketing: frMarketing,
		saas: frSaas,
		shared: frShared,
	},
	zh: {
		mail: zhMail,
		marketing: zhMarketing,
		saas: zhSaas,
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
