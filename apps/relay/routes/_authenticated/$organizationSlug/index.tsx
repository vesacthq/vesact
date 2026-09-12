import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { Button } from "@repo/ui/components/button";
import {
	Frame,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@repo/ui/components/reui/frame";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { BookOpenIcon, KeyRoundIcon } from "lucide-react";

const organizationRoute = getRouteApi("/_authenticated/$organizationSlug");

export const Route = createFileRoute("/_authenticated/$organizationSlug/")({
	component: OrganizationHomePage,
	head: () => ({ meta: [{ title: documentTitle("Overview") }] }),
});

function OrganizationHomePage() {
	const { organization } = organizationRoute.useLoaderData();
	const t = useTranslations();

	return (
		<div>
			<PageHeader title={organization.name} subtitle={t("overview.subtitle")} />
			<Frame spacing="sm" className="max-w-2xl">
				<FrameHeader>
					<FrameTitle>{t("overview.quickStart.title")}</FrameTitle>
					<FrameDescription>{t("overview.quickStart.description")}</FrameDescription>
				</FrameHeader>
				<FramePanel>
					<pre className="px-3 py-2 font-mono text-xs overflow-x-auto rounded-md bg-muted">
						{`curl -H "Authorization: Bearer $RELAY_API_KEY" ${config.apiUrl}/v1/me`}
					</pre>
				</FramePanel>
				<FrameFooter className="gap-2 flex flex-wrap">
					<Button
						size="sm"
						nativeButton={false}
						render={
							<Link
								to="/$organizationSlug/settings/api-keys"
								params={{ organizationSlug: organization.slug }}
							/>
						}
					>
						<KeyRoundIcon className="size-4" aria-hidden="true" />
						{t("overview.quickStart.apiKeys")}
					</Button>
					<Button
						size="sm"
						variant="outline"
						nativeButton={false}
						render={(props) => (
							<a {...props} href={`${config.apiUrl}/v1/docs`}>
								{props.children}
							</a>
						)}
					>
						<BookOpenIcon className="size-4" aria-hidden="true" />
						{t("overview.quickStart.apiReference")}
					</Button>
				</FrameFooter>
			</Frame>
		</div>
	);
}
