import { createHmac } from "node:crypto";

import { expect, type Page, test } from "@playwright/test";

import { e2eUsers } from "./fixtures/users";

// LocaleSwitch is client-only; once it renders, React owns the forms.
async function waitForHydration(page: Page) {
	await expect(page.getByRole("button", { name: "Language" })).toBeVisible();
}

/**
 * A full document load after signing in would mean the app went back through
 * the server: either a bounce to /login because the guard still held the
 * anonymous session, or a reload hiding that bounce.
 */
function watchDocumentLoads(page: Page) {
	const loads: string[] = [];
	page.on("request", (request) => {
		if (request.resourceType() === "document") {
			loads.push(new URL(request.url()).pathname);
		}
	});
	return loads;
}

async function signInWithPassword(page: Page, user: { email: string; password: string }) {
	await page.getByRole("tab", { name: "Password" }).click();
	await page.getByRole("textbox", { name: /email/i }).fill(user.email);
	await page.locator('input[autocomplete="current-password"]').fill(user.password);
	await page.getByRole("button", { name: "Sign in" }).click();
}

async function expectSecurityPage(page: Page) {
	await expect(page).toHaveURL(/\/account\/security(\?|$)/);
	await expect(page.getByRole("heading", { name: "Security" })).toBeVisible();
}

async function signOut(page: Page, origin: string) {
	const response = await page.request.post("api/auth/sign-out", {
		headers: { Origin: origin },
		data: {},
	});
	expect(response.ok(), await response.text()).toBe(true);
}

/** RFC 6238 with the defaults Better Auth issues in its otpauth URI. */
function totpCode(totpURI: string) {
	const url = new URL(totpURI);
	const secret = url.searchParams.get("secret") ?? "";
	const digits = Number(url.searchParams.get("digits") ?? 6);
	const period = Number(url.searchParams.get("period") ?? 30);
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
	const bytes: number[] = [];
	let bits = 0;
	let value = 0;
	for (const char of secret.replace(/=+$/, "").toUpperCase()) {
		value = (value << 5) | alphabet.indexOf(char);
		bits += 5;
		if (bits >= 8) {
			bytes.push((value >>> (bits - 8)) & 0xff);
			bits -= 8;
		}
	}
	const counter = Buffer.alloc(8);
	counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 1000 / period)));
	const digest = createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
	const offset = digest[digest.length - 1] & 0xf;
	const code =
		(((digest[offset] & 0x7f) << 24) |
			(digest[offset + 1] << 16) |
			(digest[offset + 2] << 8) |
			digest[offset + 3]) %
		10 ** digits;
	return code.toString().padStart(digits, "0");
}

test.describe("signing in returns to the requested page in this app", () => {
	test("with a password", async ({ page }) => {
		await page.goto("login?redirectTo=%2Faccount%2Fsecurity");
		await waitForHydration(page);
		const loads = watchDocumentLoads(page);

		await signInWithPassword(page, e2eUsers.member);

		await expectSecurityPage(page);
		expect(loads).toEqual([]);
	});

	test("with a one-time code", async ({ page, baseURL }) => {
		const origin = baseURL ?? "http://localhost:3004";
		const user = e2eUsers.totp;

		await page.goto("login?redirectTo=%2Faccount");
		await waitForHydration(page);
		await signInWithPassword(page, user);
		await expect(page).toHaveURL(/\/account(\?|$)/);

		const enabled = await page.request.post("api/auth/two-factor/enable", {
			headers: { Origin: origin },
			data: { password: user.password },
		});
		expect(enabled.ok(), await enabled.text()).toBe(true);
		const { totpURI } = (await enabled.json()) as { totpURI: string };
		const verified = await page.request.post("api/auth/two-factor/verify-totp", {
			headers: { Origin: origin },
			data: { code: totpCode(totpURI) },
		});
		expect(verified.ok(), await verified.text()).toBe(true);
		await signOut(page, origin);

		try {
			await page.goto("login?redirectTo=%2Faccount%2Fsecurity");
			await waitForHydration(page);
			const loads = watchDocumentLoads(page);

			await signInWithPassword(page, user);
			await expect(page).toHaveURL(/\/verify\?/);
			await page.locator('input[autocomplete="one-time-code"]').fill(totpCode(totpURI));

			await expectSecurityPage(page);
			expect(loads).toEqual([]);
		} finally {
			await page.request.post("api/auth/two-factor/disable", {
				headers: { Origin: origin },
				data: { password: user.password },
			});
		}
	});
});

// Signing out ends the session the setup stored, so this spec signs in on its own.
test.describe("signing in with a passkey", () => {
	test("returns to the requested page in this app", async ({ page, baseURL }) => {
		const origin = baseURL ?? "http://localhost:3004";
		const user = e2eUsers.passkey;
		const cdp = await page.context().newCDPSession(page);
		await cdp.send("WebAuthn.enable");
		await cdp.send("WebAuthn.addVirtualAuthenticator", {
			options: {
				protocol: "ctap2",
				transport: "internal",
				hasResidentKey: true,
				hasUserVerification: true,
				isUserVerified: true,
				automaticPresenceSimulation: true,
			},
		});

		await page.goto("login?redirectTo=%2Faccount%2Fsecurity");
		await waitForHydration(page);
		await signInWithPassword(page, user);
		await expectSecurityPage(page);
		await page.getByRole("button", { name: "Add passkey" }).click();
		await expect(page.getByText("Passkey added")).toBeVisible();
		await signOut(page, origin);

		await page.goto("login?redirectTo=%2Faccount%2Fsecurity");
		await waitForHydration(page);
		const loads = watchDocumentLoads(page);

		await page.getByRole("button", { name: "Login with passkey" }).click();

		await expectSecurityPage(page);
		expect(loads).toEqual([]);
	});
});
