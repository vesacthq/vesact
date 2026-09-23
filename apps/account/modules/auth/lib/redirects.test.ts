import { describe, expect, it } from "vitest";

import { getReturnUrl, getSafeRedirectUrl, productNameForUrl } from "./redirects";

const options = {
	fallback: "https://app.allcast.cc/",
	allowedOrigins: ["https://app.allcast.cc", "https://second.allcast.cc"],
	base: "https://app.allcast.cc/account",
};

describe("getSafeRedirectUrl", () => {
	it.each([
		["https://app.allcast.cc/inbox?x=1#y", "https://app.allcast.cc/inbox?x=1#y"],
		["https://second.allcast.cc/settings/api-keys", "https://second.allcast.cc/settings/api-keys"],
		["/account", "/account"],
		["/account/../login", "/login"],
	])("allows %s", (value, expected) => {
		expect(getSafeRedirectUrl(value, options)).toBe(expected);
	});

	it.each([
		"https://attacker.example",
		"https://app.allcast.cc.attacker.example/",
		"//attacker.example",
		"/\\attacker.example",
		"/..//attacker.example",
		"/x/../\\attacker.example/path?x=1",
		"javascript:alert(1)",
		"data:text/html,malicious",
		"inbox",
		"http://app.allcast.cc/",
	])("rejects %s", (value) => {
		expect(getSafeRedirectUrl(value, options)).toBe("https://app.allcast.cc/");
	});

	it("uses the fallback when nothing is given", () => {
		expect(getSafeRedirectUrl(undefined, options)).toBe("https://app.allcast.cc/");
	});

	it("falls back to the app root when the fallback is unsafe too", () => {
		expect(
			getSafeRedirectUrl("https://attacker.example", { ...options, fallback: "//x.example" }),
		).toBe("/");
	});
});

describe("getReturnUrl", () => {
	it("returns to the product the user came from, or to Studio", () => {
		expect(getReturnUrl("https://second.allcast.cc/keys", options)).toBe(
			"https://second.allcast.cc/keys",
		);
		expect(getReturnUrl("https://attacker.example/", options)).toBe("https://app.allcast.cc/");
		expect(getReturnUrl(undefined, options)).toBe("https://app.allcast.cc/");
	});
});

describe("productNameForUrl", () => {
	const products = [
		{ name: "Allcast", url: "https://app.allcast.cc" },
		{ name: "Website", url: undefined },
	];

	it("names the product by origin", () => {
		expect(productNameForUrl("https://app.allcast.cc/inbox", products)).toBe("Allcast");
		expect(productNameForUrl("https://www.allcast.cc/", products)).toBe("Allcast");
		expect(productNameForUrl("not a url", products)).toBe("Website");
	});
});
