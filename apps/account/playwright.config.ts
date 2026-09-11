import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const configDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(configDir, "../../.env.local") });

/**
 * The app is served on the port its advertised URL names, so the client bundle,
 * the Worker and the server Playwright starts agree. Override with `PW_PORT`.
 */
const e2ePort =
	process.env.PW_PORT ??
	(new URL(process.env.VITE_ACCOUNT_URL ?? "http://localhost:3200").port || "3200");
const baseURL = `http://localhost:${e2ePort}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { outputFolder: "playwright-report" }]],
	use: {
		baseURL,
		trace: "on-first-retry",
		video: {
			mode: "retain-on-failure",
			size: { width: 640, height: 480 },
		},
	},
	projects: [
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/,
			use: {
				...devices["Desktop Chrome"],
			},
		},
		{
			name: "chromium",
			testIgnore: /.*\.setup\.ts/,
			dependencies: ["setup"],
			use: {
				...devices["Desktop Chrome"],
			},
		},
	],
	webServer: {
		command: "pnpm --filter account run dev",
		url: baseURL,
		env: {
			...process.env,
			PORT: e2ePort,
		},
		// Only reuse when explicitly requested — otherwise a random process on the port
		// (e.g. another framework) makes tests hit the wrong app and show false 404s.
		reuseExistingServer: process.env.PW_REUSE_SERVER === "1",
		stdout: "pipe",
		timeout: 300 * 1000,
	},
});
