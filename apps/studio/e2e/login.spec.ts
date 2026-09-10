import { expect, test } from "@playwright/test";

test.describe("authentication guard", () => {
	test("sends a signed-out visitor to the auth app with a way back", async ({
		request,
		baseURL,
	}) => {
		const response = await request.get("/", { maxRedirects: 0 });

		expect([302, 307]).toContain(response.status());

		const location = new URL(response.headers().location ?? "");
		expect(location.pathname).toBe("/login");
		expect(new URL(location.searchParams.get("redirectTo") ?? "").pathname).toBe("/");
	});

	test("redirects the old login path to the auth app", async ({ request }) => {
		const response = await request.get("/login?redirectTo=%2Fx", { maxRedirects: 0 });

		expect(response.status()).toBe(302);
		expect(response.headers().location).toMatch(/\/login\?redirectTo=%2Fx$/);
	});
});
