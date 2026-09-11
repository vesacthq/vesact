import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const alias = (target: string) => fileURLToPath(new URL(target, import.meta.url));

/**
 * Vitest picks up files matching `**\/*.{test,spec}.ts(x)` by default and
 * would otherwise try to load Playwright specs in `e2e/`. Keeping the two
 * runners separate avoids Playwright's `@playwright/test` module being
 * evaluated by Vitest and hanging the process.
 */
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@config": alias("./config"),
			"@auth": alias("./modules/auth"),
			"@account": alias("./modules/account"),
			"@admin": alias("./modules/admin"),
			"@organizations": alias("./modules/organizations"),
			"@onboarding": alias("./modules/onboarding"),
			"@payments": alias("./modules/payments"),
			"@i18n": alias("./modules/i18n"),
			"@shared": alias("./modules/shared"),
		},
	},
	test: {
		clearMocks: false,
		exclude: ["**/node_modules/**", "**/.output/**", "**/dist/**", "e2e/**"],
	},
});
