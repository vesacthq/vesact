// secrets/dev.env is the one local-dev source: it becomes .env.local (Vite, Node scripts)
// and every Worker's .dev.vars. secrets/<app>.dev.env holds the few values one Worker
// needs different, layered on top. Lines pass through byte for byte; only keys merge.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";

const parse = (text: string): Record<string, string> =>
	Object.fromEntries(
		text
			.split(/\r?\n/)
			.map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/))
			.filter((m): m is RegExpMatchArray => m !== null)
			.map((m) => [m[1], m[2]]),
	);
const decrypt = (file: string) => parse(execFileSync("sops", ["-d", file], { encoding: "utf8" }));
const serialize = (vars: Record<string, string>) =>
	Object.entries(vars)
		.map(([key, value]) => `${key}=${value}`)
		.join("\n") + "\n";

const shared = decrypt("secrets/dev.env");
writeFileSync(".env.local", serialize(shared));

for (const app of readdirSync("apps")) {
	if (!existsSync(`apps/${app}/wrangler.jsonc`)) continue;
	const override = existsSync(`secrets/${app}.dev.env`) ? decrypt(`secrets/${app}.dev.env`) : {};
	writeFileSync(`apps/${app}/.dev.vars`, serialize({ ...shared, ...override }));
}
