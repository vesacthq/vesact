import { describe, expect, it } from "vitest";

import { preloadLinkHeaders, withEarlyHints } from "./early-hints";

const head = `<head><meta charSet="utf-8"/>
<link rel="preload" as="image" href="/images/hero.webp"/>
<link rel="icon" href="/favicon.ico"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans"/>
<link rel="stylesheet" href="/assets/globals-Cvm-TYCH.css" data-precedence="default"/>
<link rel="modulepreload" href="/assets/index-CIS8MnU-.js"/>
<link rel="modulepreload" href="/assets/ui-B9TJHku2.js"/>
<script class="$tsr" id="$tsr-stream-barrier">self.$R={}</script>
<script type="module" async="" src="/assets/index-CIS8MnU-.js"></script>
<script src="//cdn.example.com/x.js"></script>`;

const html = `<!DOCTYPE html><html lang="en">${head}</head><body><div id="app">hello</div></body></html>`;

function streamOf(text: string, chunkSize: number) {
	const encoder = new TextEncoder();
	let offset = 0;
	return new ReadableStream<Uint8Array>({
		pull(controller) {
			if (offset >= text.length) {
				controller.close();
				return;
			}
			controller.enqueue(encoder.encode(text.slice(offset, offset + chunkSize)));
			offset += chunkSize;
		},
	});
}

function htmlResponse(body: ReadableStream<Uint8Array> | string, status = 200) {
	return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

describe("preloadLinkHeaders", () => {
	it("lists the page's own stylesheet and module scripts once, in document order", () => {
		expect(preloadLinkHeaders(head)).toEqual([
			"</assets/globals-Cvm-TYCH.css>; rel=preload; as=style",
			"</assets/index-CIS8MnU-.js>; rel=preload; as=script; crossorigin",
			"</assets/ui-B9TJHku2.js>; rel=preload; as=script; crossorigin",
		]);
	});

	it("ignores images, icons, inline scripts and other origins", () => {
		const links = preloadLinkHeaders(head).join("\n");
		expect(links).not.toContain("hero.webp");
		expect(links).not.toContain("favicon");
		expect(links).not.toContain("googleapis");
		expect(links).not.toContain("cdn.example.com");
	});
});

describe("withEarlyHints", () => {
	it("adds Link headers from a head that spans several chunks and keeps the body intact", async () => {
		const response = await withEarlyHints(htmlResponse(streamOf(html, 100)));

		expect(response.headers.get("Link")).toBe(
			[
				"</assets/globals-Cvm-TYCH.css>; rel=preload; as=style",
				"</assets/index-CIS8MnU-.js>; rel=preload; as=script; crossorigin",
				"</assets/ui-B9TJHku2.js>; rel=preload; as=script; crossorigin",
			].join(", "),
		);
		expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
		expect(await response.text()).toBe(html);
	});

	it("keeps a body that fits in one chunk", async () => {
		const response = await withEarlyHints(htmlResponse(html));

		expect(response.headers.get("Link")).toContain("globals-Cvm-TYCH.css");
		expect(await response.text()).toBe(html);
	});

	it("leaves non-HTML and non-200 responses untouched", async () => {
		const json = new Response('{"result":1}', {
			headers: { "content-type": "application/json" },
		});
		const redirect = new Response(null, { status: 302, headers: { location: "/login" } });
		const error = htmlResponse(html, 500);

		expect(await withEarlyHints(json)).toBe(json);
		expect(await withEarlyHints(redirect)).toBe(redirect);
		expect(await withEarlyHints(error)).toBe(error);
	});

	it("gives up without hints when no head ends within the first 64 KiB", async () => {
		const long = `<html><body>${"x".repeat(70 * 1024)}</body></html>`;
		const response = await withEarlyHints(htmlResponse(streamOf(long, 4096)));

		expect(response.headers.get("Link")).toBeNull();
		expect(await response.text()).toBe(long);
	});
});
