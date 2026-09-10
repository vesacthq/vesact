import { expect, test } from "@playwright/test";

test.describe("admin guard", () => {
	test("sends a signed-out visitor to login with a way back", async ({ request, baseURL }) => {
		const response = await request.get("/admin/users", { maxRedirects: 0 });

		expect([302, 307]).toContain(response.status());

		const location = new URL(response.headers().location ?? "", baseURL);
		expect(location.pathname).toBe("/login");
		expect(new URL(location.searchParams.get("redirectTo") ?? "", baseURL).pathname).toBe(
			"/admin/users",
		);
	});
});
