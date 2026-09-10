import { describe, expect, it } from "vitest";

import { getSafeRedirectUrl } from "./redirects";

const options = {
	fallback: "https://studio.vesact.com/",
	allowedOrigins: ["https://studio.vesact.com", "https://relay.vesact.com"],
	base: "https://auth.vesact.com",
};

describe("getSafeRedirectUrl", () => {
	it.each([
		["https://studio.vesact.com/inbox?x=1#y", "https://studio.vesact.com/inbox?x=1#y"],
		["https://relay.vesact.com/settings/api-keys", "https://relay.vesact.com/settings/api-keys"],
		["/account", "/account"],
		["/account/../login", "/login"],
	])("allows %s", (value, expected) => {
		expect(getSafeRedirectUrl(value, options)).toBe(expected);
	});

	it.each([
		"https://attacker.example",
		"https://studio.vesact.com.attacker.example/",
		"//attacker.example",
		"/\\attacker.example",
		"javascript:alert(1)",
		"data:text/html,malicious",
		"inbox",
		"http://studio.vesact.com/",
	])("rejects %s", (value) => {
		expect(getSafeRedirectUrl(value, options)).toBe("https://studio.vesact.com/");
	});

	it("uses the fallback when nothing is given", () => {
		expect(getSafeRedirectUrl(undefined, options)).toBe("https://studio.vesact.com/");
	});

	it("falls back to the app root when the fallback is unsafe too", () => {
		expect(
			getSafeRedirectUrl("https://attacker.example", { ...options, fallback: "//x.example" }),
		).toBe("/");
	});
});
