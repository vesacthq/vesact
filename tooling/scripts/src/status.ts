import { execFileSync } from "node:child_process";

const repo = "vesacthq/vesact";
const owner = "vesacthq";
const projectNumber = "1";

type Issue = {
	number: number;
	title: string;
	state: "open" | "closed";
	body?: string | null;
	sub_issues_summary?: { total: number; completed: number };
};

type ProjectItem = {
	content?: { number?: number; title?: string };
	status?: string;
};

function gh<T>(args: string[]): T {
	return JSON.parse(execFileSync("gh", args, { encoding: "utf8" })) as T;
}

function subIssues(issue: number) {
	return gh<Issue[]>(["api", `repos/${repo}/issues/${issue}/sub_issues?per_page=100`]);
}

function checkboxes(body: string | null | undefined) {
	const done = (body?.match(/^\s*- \[x\]/gim) ?? []).length;
	const open = (body?.match(/^\s*- \[ \]/gm) ?? []).length;
	return { done, total: done + open };
}

function bar(done: number, total: number) {
	if (total === 0) {
		return "";
	}
	const width = 10;
	const filled = Math.round((done / total) * width);
	return `${"█".repeat(filled)}${"░".repeat(width - filled)} ${done}/${total}`;
}

function width(text: string) {
	let total = 0;
	for (const char of text) {
		total += char.codePointAt(0)! > 0x2e80 ? 2 : 1;
	}
	return total;
}

function pad(text: string, columns: number) {
	return text + " ".repeat(Math.max(0, columns - width(text)));
}

function progress(issue: Issue) {
	if (issue.state === "closed") {
		return "完成";
	}
	const summary = issue.sub_issues_summary;
	if (summary && summary.total > 0) {
		return bar(summary.completed, summary.total);
	}
	const boxes = checkboxes(issue.body);
	return bar(boxes.done, boxes.total);
}

const items = gh<{ items: ProjectItem[] }>([
	"project",
	"item-list",
	projectNumber,
	"--owner",
	owner,
	"--format",
	"json",
	"--limit",
	"500",
]).items;
const statusOf = new Map<number, string>();
const inTree = new Set<number>();
for (const item of items) {
	if (item.content?.number !== undefined && item.status) {
		statusOf.set(item.content.number, item.status);
	}
}

const tracks = gh<Issue[]>([
	"issue",
	"list",
	"--repo",
	repo,
	"--label",
	"track",
	"--state",
	"all",
	"--json",
	"number,title,state",
]);

for (const track of tracks.sort((a, b) => a.number - b.number)) {
	inTree.add(track.number);
	console.log(`${track.title} #${track.number}${track.state === "closed" ? "  已完成" : ""}`);
	for (const stage of subIssues(track.number)) {
		inTree.add(stage.number);
		const label = stage.title.replace(/^.*?[:：]\s*/, "");
		const status = stage.state === "closed" ? "Done" : (statusOf.get(stage.number) ?? "");
		console.log(
			`  ${pad(label, 28)} ${pad(`#${stage.number}`, 5)} ${pad(progress(stage), 16)} ${status}`,
		);
	}
	console.log();
}

function section(title: string, status: string) {
	console.log(title);
	const numbers = [...statusOf.entries()]
		.filter(([number, value]) => value === status && !inTree.has(number))
		.map(([number]) => number);
	if (numbers.length === 0) {
		console.log("  （空）");
	}
	for (const number of numbers.sort((a, b) => a - b)) {
		const issue = gh<Issue>([
			"issue",
			"view",
			String(number),
			"--repo",
			repo,
			"--json",
			"number,title,body,state",
		]);
		if (issue.state === "closed") {
			continue;
		}
		const boxes = checkboxes(issue.body);
		const acceptance = boxes.total > 0 ? `  验收 ${boxes.done}/${boxes.total}` : "";
		console.log(`  #${issue.number} ${issue.title}${acceptance}`);
	}
	console.log();
}

section("Now", "Now");
section("Next", "Next");

console.log("最近合并");
const merged = gh<{ number: number; title: string; mergedAt: string }[]>([
	"pr",
	"list",
	"--repo",
	repo,
	"--state",
	"merged",
	"--limit",
	"5",
	"--json",
	"number,title,mergedAt",
]);
for (const pr of merged) {
	console.log(`  #${pr.number} ${pr.title}  ${pr.mergedAt.slice(0, 10)}`);
}
