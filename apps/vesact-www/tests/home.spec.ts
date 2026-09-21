import { expect, test } from "@playwright/test";

test.describe("home page", () => {
	test("should load", async ({ page }) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", {
				name: "One API for the channels your customers already use",
			}),
		).toBeVisible();

		await expect(page.locator('[data-test="navigation"]')).toBeVisible();
		await expect(page.locator('[data-test="color-mode-toggle"]')).toBeVisible();
	});
});

test.describe("legal pages", () => {
	for (const [slug, title] of [
		["privacy-policy", "Privacy Policy"],
		["terms", "Terms of Service"],
		["data-deletion", "Data Deletion"],
	] as const) {
		test(`${slug} renders in both locales`, async ({ page }) => {
			await page.goto(`/legal/${slug}`);
			await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();

			await page.goto(`/zh/legal/${slug}`);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("html")).toHaveAttribute("lang", "zh");
		});
	}
});
