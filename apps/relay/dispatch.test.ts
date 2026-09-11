import { describe, expect, it } from "vitest";

import { dispatch, isApiPath, notFound } from "./dispatch";

const prod = { consoleHost: "relay.vesact.com", apiHost: "api.vesact.com" };
const dev = { consoleHost: "localhost:3005", apiHost: "localhost:3005" };

describe("isApiPath", () => {
	it("matches the three prefixes and their subpaths only", () => {
		expect(isApiPath("/v1")).toBe(true);
		expect(isApiPath("/v1/health")).toBe(true);
		expect(isApiPath("/webhooks/meta")).toBe(true);
		expect(isApiPath("/oauth/meta/callback")).toBe(true);
		expect(isApiPath("/v10/health")).toBe(false);
		expect(isApiPath("/")).toBe(false);
		expect(isApiPath("/settings")).toBe(false);
	});
});

describe("dispatch", () => {
	it("sends API paths to the API on either host", () => {
		expect(dispatch(new URL("https://api.vesact.com/v1/health"), prod)).toBe("api");
		expect(dispatch(new URL("https://relay.vesact.com/v1/health"), prod)).toBe("api");
	});

	it("serves the console on the console host", () => {
		expect(dispatch(new URL("https://relay.vesact.com/"), prod)).toBe("console");
		expect(dispatch(new URL("https://relay.vesact.com/keys"), prod)).toBe("console");
	});

	it("has no pages on the API host", () => {
		expect(dispatch(new URL("https://api.vesact.com/"), prod)).toBe("not-found");
		expect(dispatch(new URL("https://api.vesact.com/keys"), prod)).toBe("not-found");
	});

	it("serves everything locally, where both hosts are one", () => {
		expect(dispatch(new URL("http://localhost:3005/"), dev)).toBe("console");
		expect(dispatch(new URL("http://localhost:3005/v1/health"), dev)).toBe("api");
	});
});

describe("notFound", () => {
	it("answers with the error shape of the API", async () => {
		const response = notFound("GET", "/keys");
		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({
			defined: false,
			code: "NOT_FOUND",
			status: 404,
			message: "No route for GET /keys",
		});
	});
});
