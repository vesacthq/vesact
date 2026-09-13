import { describe, expect, it } from "vitest";

import { getReturnUrl, getSafeRedirectUrl, productNameForUrl } from "./redirects";

const options = {
	fallback: "https://studio.vesact.com/",
	allowedOrigins: ["https://studio.vesact.com", "https://relay.vesact.com"],
	base: "https://account.vesact.com",
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

describe("getReturnUrl", () => {
	it("returns to the product the user came from, or to Studio", () => {
		expect(getReturnUrl("https://relay.vesact.com/keys", options)).toBe(
			"https://relay.vesact.com/keys",
		);
		expect(getReturnUrl("https://attacker.example/", options)).toBe("https://studio.vesact.com/");
		expect(getReturnUrl(undefined, options)).toBe("https://studio.vesact.com/");
	});
});

describe("productNameForUrl", () => {
	const products = [
		{ name: "Studio", url: "https://studio.vesact.com" },
		{ name: "Vesact", url: undefined },
	];

	it("names the product by origin", () => {
		expect(productNameForUrl("https://studio.vesact.com/inbox", products)).toBe("Studio");
		expect(productNameForUrl("https://www.vesact.com/", products)).toBe("Vesact");
		expect(productNameForUrl("not a url", products)).toBe("Vesact");
	});
});
