import { mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Workers Assets serves the built client by file path, so an app mounted under
// a base path needs its output nested to match. Vite's `base` only rewrites the
// URLs it emits.
async function nestClientOutput(prefix: string) {
	const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.output/client");
	const entries = await readdir(clientDir);

	if (entries.length === 1 && entries[0] === prefix) {
		return;
	}

	const target = path.join(clientDir, prefix);
	await mkdir(target, { recursive: true });

	for (const entry of entries) {
		if (entry !== prefix) {
			await rename(path.join(clientDir, entry), path.join(target, entry));
		}
	}
}

const prefix = process.argv[2];

if (!prefix) {
	throw new Error("Usage: nest-client-output.mts <prefix>");
}

void nestClientOutput(prefix);
