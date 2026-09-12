import { expect, type Page, test } from "@playwright/test";

import { e2eUsers } from "./fixtures/users";

// LocaleSwitch is client-only; once it renders, the router owns navigation.
async function waitForHydration(page: Page) {
	await expect(page.getByRole("button", { name: "Language" })).toBeVisible();
}

test.describe("as a member", () => {
	test.use({ storageState: e2eUsers.member.statePath });

	test("switches settings pages without a server round trip", async ({ page }) => {
		await page.goto("account");
		await waitForHydration(page);

		const serverCalls: string[] = [];
		page.on("request", (request) => {
			const { pathname } = new URL(request.url());
			if (pathname.startsWith("/_serverFn/") || pathname === "/api/auth/get-session") {
				serverCalls.push(pathname);
			}
		});

		await page.getByRole("link", { name: "Security" }).click();

		await expect(page).toHaveURL(/\/account\/security(\?|$)/);
		await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
		expect(serverCalls).toEqual([]);
	});
});
