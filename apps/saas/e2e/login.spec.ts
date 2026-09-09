import { expect, test } from "@playwright/test";

async function waitForAuthPageHydration(page: import("@playwright/test").Page) {
	// LocaleSwitch is client-only; the color-mode toggle wrapper is SSR'd.
	await expect(page.getByRole("button", { name: "Language" })).toBeVisible();
}

test.describe("login page", () => {
	test("should load and show all relevant login form components", async ({ page }) => {
		await page.goto("/studio/login");
		await waitForAuthPageHydration(page);

		// Main heading and subtitle
		await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
		await expect(page.getByText("Please enter your credentials to sign in.")).toBeVisible();

		// Login mode switch (Magic link / Password)
		await expect(page.getByRole("tab", { name: "Magic link" })).toBeVisible();
		await expect(page.getByRole("tab", { name: "Password" })).toBeVisible();

		// Email field
		await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();

		// Switch to password mode so password-specific UI is visible
		await page.getByRole("tab", { name: "Password" }).click();

		// Password field and forgot password link
		const passwordInput = page.locator('input[autocomplete="current-password"]');
		await expect(passwordInput).toBeVisible();
		await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();

		// Submit button (password mode)
		await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

		// "Or continue with" divider
		await expect(page.getByText("Or continue with")).toBeVisible();

		// Passkey button
		await expect(page.getByRole("button", { name: "Login with passkey" })).toBeVisible();

		// Sign up link
		await expect(page.getByRole("link", { name: /Create an account/ })).toBeVisible();
		await expect(page.getByText("Don't have an account yet?")).toBeVisible();
	});

	test("should switch between magic link and password auth modes", async ({ page }) => {
		await page.goto("/studio/login");
		await waitForAuthPageHydration(page);

		const passwordInput = page.locator('input[autocomplete="current-password"]');

		// Ensure password mode: click Password tab then assert
		await page.getByRole("tab", { name: "Password" }).click();
		await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
		await expect(passwordInput).toBeVisible();

		// Switch to magic link mode
		await page.getByRole("tab", { name: "Magic link" }).click();
		await expect(page.getByRole("button", { name: "Send magic link" })).toBeVisible();
		await expect(passwordInput).toBeHidden();

		// Switch back to password mode
		await page.getByRole("tab", { name: "Password" }).click();
		await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
		await expect(passwordInput).toBeVisible();
	});

	test("should show a last used badge on the matching authentication method", async ({
		page,
		context,
		baseURL,
	}) => {
		await context.addCookies([
			{
				name: "better-auth.last_used_login_method",
				value: "github",
				url: baseURL ?? "http://localhost:3100",
			},
		]);

		await page.goto("/studio/login");
		await waitForAuthPageHydration(page);

		await expect(page.getByRole("button", { name: /github/i })).toContainText("Last used");
		await expect(page.getByRole("button", { name: /google/i })).not.toContainText("Last used");
		await expect(page.getByRole("tab", { name: "Password" })).not.toContainText("Last used");
	});
});
