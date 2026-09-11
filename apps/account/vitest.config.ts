import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const tsconfig = JSON.parse(readFileSync(new URL("./tsconfig.json", import.meta.url), "utf8")) as {
	compilerOptions: { paths: Record<string, string[]> };
};

// The app's aliases, as tsconfig.json declares them: `@auth/*` → `./modules/auth/*`.
const alias = Object.fromEntries(
	Object.entries(tsconfig.compilerOptions.paths).map(([name, [target]]) => [
		name.replace(/\/\*$/, ""),
		fileURLToPath(new URL(target.replace(/\/\*$/, ""), import.meta.url)),
	]),
);

/**
 * Vitest picks up files matching `**\/*.{test,spec}.ts(x)` by default and
 * would otherwise try to load Playwright specs in `e2e/`. Keeping the two
 * runners separate avoids Playwright's `@playwright/test` module being
 * evaluated by Vitest and hanging the process.
 */
export default defineConfig({
	plugins: [react()],
	resolve: { alias },
	test: {
		clearMocks: false,
		exclude: ["**/node_modules/**", "**/.output/**", "**/dist/**", "e2e/**"],
	},
});
