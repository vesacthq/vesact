import { useTranslations } from "@i18n/intl";
import { setLocaleCookie } from "@i18n/lib/update-locale";
import { useLocalePathname, useLocaleRouter } from "@i18n/routing";
import { authClient } from "@repo/auth/client";
import type { Locale } from "@repo/i18n";
import { config as i18nConfig } from "@repo/i18n";
import { getCurrentLocale } from "@repo/i18n/runtime";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { toast } from "@repo/ui/components/toast";
import { SettingsItem } from "@shared/components/SettingsItem";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

export function UserLanguageForm() {
	const currentLocale = getCurrentLocale();
	const localePathname = useLocalePathname();
	const localeRouter = useLocaleRouter();
	const t = useTranslations();
	const router = useRouter();
	const [locale, setLocale] = useState<Locale | undefined>(currentLocale as Locale);

	const updateLocaleMutation = useMutation({
		mutationFn: async () => {
			if (!locale) {
				return;
			}

			await authClient.updateUser({
				locale,
			});
			setLocaleCookie(locale);
			const search = typeof window !== "undefined" ? window.location.search : "";
			localeRouter.replace(`${localePathname}${search}`, {
				locale,
			});
			void router.invalidate();
		},
	});

	const saveLocale = async () => {
		try {
			await updateLocaleMutation.mutateAsync();

			toast.add({ title: t("settings.account.language.notifications.success"), type: "success" });
		} catch {
			toast.add({ title: t("settings.account.language.notifications.error"), type: "error" });
		}
	};

	if (Object.keys(i18nConfig.locales).length <= 1) {
		return null;
	}

	const localeItems = Object.entries(i18nConfig.locales).map(([key, loc]) => ({
		value: key,
		label: loc.label,
	}));

	return (
		<SettingsItem
			title={t("settings.account.language.title")}
			description={t("settings.account.language.description")}
		>
			<Select
				value={locale}
				items={localeItems}
				onValueChange={(value) => {
					setLocale(value as Locale);
					void saveLocale();
				}}
				disabled={updateLocaleMutation.isPending}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{Object.entries(i18nConfig.locales).map(([key, value]) => (
						<SelectItem key={key} value={key}>
							{value.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</SettingsItem>
	);
}
