import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "./redirects";

describe("getSafeRedirectPath", () => {
	it("follows paths of this app", () => {
		expect(getSafeRedirectPath("/acme/settings/api-keys?tab=1#k")).toBe(
			"/acme/settings/api-keys?tab=1#k",
		);
	});

	it("falls back to the root for anything that could leave the app", () => {
		for (const value of [
			undefined,
			"",
			"https://evil.example/",
			"//evil.example",
			"/\\evil.example",
			"/%5Cevil.example/..//evil.example",
			"/..//evil.example",
			"/x/../\\evil.example/path?x=1",
			"javascript:alert(1)",
		]) {
			expect(getSafeRedirectPath(value)).toMatch(/^\/(?![/\\])/);
			expect(getSafeRedirectPath(value)).not.toContain("evil.example");
		}
	});
});
