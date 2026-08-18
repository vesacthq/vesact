import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest picks up files matching `**\/*.{test,spec}.ts(x)` by default and
 * would otherwise try to load Playwright specs in `e2e/`. Keeping the two
 * runners separate avoids Playwright's `@playwright/test` module being
 * evaluated by Vitest and hanging the process.
 */
export default defineConfig({
	plugins: [react()],
	test: {
		exclude: ["**/node_modules/**", "**/.output/**", "**/dist/**", "e2e/**"],
	},
});
