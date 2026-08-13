import React from "react";
import { Heading, Link, Text } from "react-email";

import PrimaryButton from "../components/PrimaryButton";
import Wrapper from "../components/Wrapper";
import { getMailTranslator } from "../lib/i18n";
import { defaultLocale } from "../lib/translations";
import type { BaseMailProps } from "../types";

export function Notification({
	title,
	message,
	link,
	locale,
}: {
	title: string;
	message?: string;
	link?: string;
} & BaseMailProps) {
	const t = getMailTranslator(locale);

	return (
		<Wrapper>
			<Heading className="mt-0 text-xl font-semibold">{title}</Heading>
			{message ? <Text>{message}</Text> : null}
			{link ? (
				<>
					<Text>{t("notification.openInApp")}</Text>
					<PrimaryButton href={link}>{t("notification.view")} &rarr;</PrimaryButton>
					<Text className="text-sm text-muted-foreground">
						{t("common.openLinkInBrowser")}
						<br />
						<Link href={link}>{link}</Link>
					</Text>
				</>
			) : null}
		</Wrapper>
	);
}

Notification.PreviewProps = {
	locale: defaultLocale,
	title: "Example",
	message: "This is a notification email.",
	link: "https://example.com",
};

export default Notification;
