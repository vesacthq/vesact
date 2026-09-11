import { logger } from "@repo/logs";

interface Outcome {
	name: string;
	ok: boolean;
	detail?: string;
}

/** Cloudflare Access service token headers, set when the target is preview. */
export function accessHeaders(): Record<string, string> {
	return process.env.CF_ACCESS_CLIENT_ID
		? {
				"CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
				"CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET ?? "",
			}
		: {};
}

/** Collects named checks; a check passes by returning `true`, fails with a reason. */
export function createChecks() {
	const outcomes: Outcome[] = [];

	async function check(name: string, run: () => Promise<true | string>) {
		try {
			const result = await run();
			outcomes.push({ name, ok: result === true, detail: result === true ? undefined : result });
		} catch (error) {
			outcomes.push({
				name,
				ok: false,
				detail: error instanceof Error ? error.message : String(error),
			});
		}
	}

	function report(): never {
		for (const outcome of outcomes) {
			logger.log(
				`${outcome.ok ? "✓" : "✗"} ${outcome.name}${outcome.detail ? ` — ${outcome.detail}` : ""}`,
			);
		}

		const failed = outcomes.filter((outcome) => !outcome.ok).length;
		logger.log(`${outcomes.length - failed}/${outcomes.length} passed`);
		process.exit(failed === 0 ? 0 : 1);
	}

	return { check, report };
}
