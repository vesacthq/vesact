import { Badge } from "@repo/ui/components/reui/badge";
import {
	Timeline,
	TimelineContent,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle,
} from "@repo/ui/components/reui/timeline";
import { useFormatter, useTranslations } from "use-intl";

const CHANGELOG_ENTRY_KEYS = [
	"clientPortals",
	"planClarity",
	"quietWeek",
	"workspaceSwitching",
	"invites",
	"launch",
] as const;

const CHANGE_ITEM_KEYS = ["item1", "item2", "item3"] as const;

const CHANGE_KINDS = ["added", "improved", "fixed"] as const;

type ChangeKind = (typeof CHANGE_KINDS)[number];

const CHANGE_KIND_VARIANTS = {
	added: "success",
	improved: "info",
	fixed: "warning",
} as const satisfies Record<ChangeKind, string>;

function isChangeKind(value: string): value is ChangeKind {
	return CHANGE_KINDS.some((kind) => kind === value);
}

export function ChangelogSection() {
	const t = useTranslations("changelog");
	const formatter = useFormatter();

	return (
		<section id="changelog">
			<Timeline defaultValue={CHANGELOG_ENTRY_KEYS.length} className="md:ps-40 w-full">
				{CHANGELOG_ENTRY_KEYS.map((entryKey, entryIndex) => {
					const version = t(`entries.${entryKey}.version`);
					const isLatest = entryIndex === 0;

					return (
						<TimelineItem key={entryKey} step={entryIndex + 1}>
							<TimelineHeader>
								<TimelineDate className="md:-left-48 md:absolute md:top-1 md:mb-0 md:w-36">
									{formatter.dateTime(new Date(`${t(`entries.${entryKey}.date`)}T12:00:00`), {
										dateStyle: "medium",
									})}
								</TimelineDate>
								<TimelineTitle className="gap-2 text-lg flex flex-wrap items-center">
									{t(`entries.${entryKey}.title`)}
									{version ? (
										<Badge size="xs" variant="outline">
											{version}
										</Badge>
									) : null}
									{isLatest ? <Badge size="xs">{t("latest")}</Badge> : null}
								</TimelineTitle>
							</TimelineHeader>
							<TimelineIndicator />
							<TimelineSeparator />
							<TimelineContent>
								<p className="leading-relaxed text-pretty">{t(`entries.${entryKey}.summary`)}</p>
								<ul className="mt-4 gap-3 flex flex-col">
									{CHANGE_ITEM_KEYS.map((changeKey) => {
										const kindValue = t(`entries.${entryKey}.changes.${changeKey}.kind`);
										const kind = isChangeKind(kindValue) ? kindValue : "improved";

										return (
											<li key={`${entryKey}-${changeKey}`} className="gap-2.5 flex items-start">
												<Badge size="xs" variant={CHANGE_KIND_VARIANTS[kind]}>
													{t(`kinds.${kind}`)}
												</Badge>
												<span className="text-sm leading-relaxed">
													{t(`entries.${entryKey}.changes.${changeKey}.text`)}
												</span>
											</li>
										);
									})}
								</ul>
							</TimelineContent>
						</TimelineItem>
					);
				})}
			</Timeline>
		</section>
	);
}
