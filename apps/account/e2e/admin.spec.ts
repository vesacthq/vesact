import { expect, type Locator, type Page, test } from "@playwright/test";

import { e2eUsers } from "./fixtures/users";

// LocaleSwitch is client-only; once it renders, React owns the forms and inputs.
async function waitForHydration(page: Page) {
	await expect(page.getByRole("button", { name: "Language" })).toBeVisible();
}

test.describe("signed out", () => {
	test("sends a visitor from the admin area to login with a way back", async ({
		request,
		baseURL,
	}) => {
		const response = await request.get("admin/users", { maxRedirects: 0 });

		expect([302, 307]).toContain(response.status());

		const location = new URL(response.headers().location ?? "", baseURL);
		expect(location.pathname).toBe("/account/login");
		expect(new URL(location.searchParams.get("redirectTo") ?? "", baseURL).pathname).toBe(
			"/admin/users",
		);
	});
});

test.describe("as a member", () => {
	test.use({ storageState: e2eUsers.member.statePath });

	test("is sent back to the account page and sees no admin entries", async ({ page }) => {
		await page.goto("admin/users");

		await page.waitForURL("**/account");
		await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
	});
});

test.describe("as the platform admin", () => {
	test.use({ storageState: e2eUsers.admin.statePath });

	test("lists and searches users", async ({ page }) => {
		await page.goto("admin/users");
		await waitForHydration(page);

		const rows = page.getByRole("table").getByRole("row");
		await expect(page.getByRole("heading", { name: "Manage users" })).toBeVisible();
		await expect(rows.filter({ hasText: e2eUsers.admin.email })).toBeVisible();

		await page.getByRole("searchbox").fill("e2e-member");

		await expect(page).toHaveURL(/query=e2e-member/);
		await expect(rows.filter({ hasText: e2eUsers.member.email })).toBeVisible();
		await expect(rows.filter({ hasText: e2eUsers.admin.email })).toHaveCount(0);
	});

	test("creates, renames and deletes an organization", async ({ page }) => {
		const name = `E2E Org ${Date.now()}`;
		const renamed = `${name} renamed`;

		await page.goto("admin/organizations/new");
		await waitForHydration(page);
		await page.getByLabel("Organization name").fill(name);
		await page.getByRole("button", { name: "Save" }).click();

		await page.waitForURL(/\/admin\/organizations\/(?!new)[^/?]+/);
		const savedToast = page.getByText("Organization has been saved.");
		await expect(savedToast).toBeVisible();
		await expect(page.getByText("Edit organization")).toBeVisible();
		await expect(page.getByLabel("Organization name")).toHaveValue(name);
		// Let the first toast go so the next one can only mean the rename was saved.
		await expect(savedToast).toBeHidden({ timeout: 15_000 });

		await page.getByLabel("Organization name").fill(renamed);
		await expect(page.getByLabel("Organization name")).toHaveValue(renamed);
		await page.getByRole("button", { name: "Save" }).click();
		await expect(savedToast).toBeVisible();
		await page.reload();
		await waitForHydration(page);
		await expect(page.getByLabel("Organization name")).toHaveValue(renamed);

		await page.goto(`admin/organizations?query=${encodeURIComponent(renamed)}`);
		await waitForHydration(page);
		const row = page.getByRole("row").filter({ hasText: renamed });
		await expect(row).toBeVisible();

		await deleteOrganizationRow(page, row);

		await expect(page.getByText("Organization has been deleted successfully!")).toBeVisible();
		await expect(row).toHaveCount(0);
	});
});

async function deleteOrganizationRow(page: Page, row: Locator) {
	await row.getByRole("button", { name: "Open menu" }).click();
	await page.getByRole("menuitem", { name: "Delete" }).click();

	const dialog = page.getByRole("alertdialog");
	await expect(dialog).toBeVisible();
	await dialog.getByRole("button", { name: "Delete" }).click();
}
