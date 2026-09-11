import { type Browser, expect, test as setup } from "@playwright/test";

import { e2eUsers, seedE2EUsers } from "./fixtures/users";

async function signIn(
	browser: Browser,
	{ email, password, statePath }: { email: string; password: string; statePath: string },
) {
	const context = await browser.newContext();
	const page = await context.newPage();

	await page.goto("/login?redirectTo=%2Faccount");
	// LocaleSwitch is client-only; once it renders, the form handlers are attached.
	await expect(page.getByRole("button", { name: "Language" })).toBeVisible();
	await page.getByRole("tab", { name: "Password" }).click();
	await page.getByRole("textbox", { name: /email/i }).fill(email);
	await page.locator('input[autocomplete="current-password"]').fill(password);
	const [response] = await Promise.all([
		page.waitForResponse((candidate) => candidate.url().includes("/api/auth/sign-in/email")),
		page.getByRole("button", { name: "Sign in" }).click(),
	]);
	expect(response.status(), await response.text()).toBe(200);
	await expect(page).toHaveURL(/\/account(\?|$)/);

	await context.storageState({ path: statePath });
	await context.close();
}

setup("seed the e2e users and sign them in", async ({ browser }) => {
	await seedE2EUsers();
	await signIn(browser, e2eUsers.admin);
	await signIn(browser, e2eUsers.member);
});
