import { expect, test } from "@playwright/test";

// Stripe and Paddle review these pages, and crawlers read them, from the server
// render alone. The Workers runtime refuses code generated from strings (an MDX
// runtime's `new Function`), and hydration would hide an empty server render
// from a test that runs JavaScript.
test.use({ javaScriptEnabled: false });

test.describe("legal pages", () => {
	for (const [slug, title] of [
		["privacy-policy", "Privacy Policy"],
		["terms", "Terms and conditions"],
	] as const) {
		test(`${slug} is in the server render`, async ({ page }) => {
			await page.goto(`/legal/${slug}`);

			await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
			await expect(page.getByText("placeholder page", { exact: false })).toBeVisible();
		});
	}
});
