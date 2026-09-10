import { expect, test } from "@playwright/test";

test.describe("blog list", () => {
	test("shows an empty state for an unknown tag", async ({ page }) => {
		await page.goto("/blog?tag=not-a-real-tag");

		await expect(page.locator('[data-test="blog-empty-filter"]')).toBeVisible();
		await expect(page.locator("article")).toHaveCount(0);
	});
});
