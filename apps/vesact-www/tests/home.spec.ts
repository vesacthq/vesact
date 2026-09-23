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
	// What Meta's URL check and crawlers get: the server-rendered HTML, no JavaScript.
	// The Workers runtime refuses code generated from strings (an MDX runtime's
	// `new Function`), and hydration would hide an empty server render from a test with JS.
	test.use({ javaScriptEnabled: false });

	for (const [slug, title] of [
		["privacy-policy", "Privacy Policy"],
		["terms", "Terms of Service"],
		["data-deletion", "Data Deletion"],
	] as const) {
		test(`${slug} renders in both locales`, async ({ page }) => {
			await page.goto(`/legal/${slug}`);
			await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
			await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();

			await page.goto(`/zh/legal/${slug}`);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("html")).toHaveAttribute("lang", "zh");
		});
	}
});
