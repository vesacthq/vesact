const headEnd = "</head>";
const maxHeadBytes = 64 * 1024;
const tagPattern = /<(link|script)\b([^>]*)>/g;
const attributePattern = /([a-zA-Z-]+)="([^"]*)"/g;

/**
 * `Link: rel=preload` headers for the page's own stylesheet and module
 * scripts. Cloudflare keeps them per URL and answers the next visitor with a
 * 103 before the Worker runs; browsers also act on the header itself, before
 * the HTML is parsed. Module scripts are fetched in CORS mode, so their
 * preload needs `crossorigin` to be reused.
 */
export function preloadLinkHeaders(head: string): string[] {
	const links = new Set<string>();

	for (const [, tag, attributeText] of head.matchAll(tagPattern)) {
		const attributes: Record<string, string> = {};
		for (const [, name, value] of attributeText.matchAll(attributePattern)) {
			attributes[name] = value.replace(/&amp;/g, "&");
		}

		const url = tag === "link" ? attributes.href : attributes.src;
		if (!url?.startsWith("/") || url.startsWith("//")) {
			continue;
		}

		if (tag === "link" && attributes.rel === "stylesheet") {
			links.add(`<${url}>; rel=preload; as=style`);
		} else if (
			(tag === "link" && attributes.rel === "modulepreload") ||
			(tag === "script" && attributes.type === "module")
		) {
			links.add(`<${url}>; rel=preload; as=script; crossorigin`);
		}
	}

	return [...links];
}

/**
 * Only the rendered `<head>` knows which hashed files this page needs, so the
 * body is read up to `</head>` before the response is answered; the shell
 * arrives in the first chunk, and nothing else is buffered.
 */
export async function withEarlyHints(response: Response): Promise<Response> {
	if (
		response.status !== 200 ||
		!response.body ||
		!response.headers.get("content-type")?.includes("text/html")
	) {
		return response;
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	const chunks: Uint8Array[] = [];
	let head = "";
	let bytes = 0;
	let ended = false;

	while (!head.includes(headEnd) && bytes < maxHeadBytes) {
		const { done, value } = await reader.read();
		if (done) {
			ended = true;
			break;
		}
		chunks.push(value);
		bytes += value.byteLength;
		head += decoder.decode(value, { stream: true });
	}

	const headers = new Headers(response.headers);
	const end = head.indexOf(headEnd);
	if (end !== -1) {
		for (const link of preloadLinkHeaders(head.slice(0, end))) {
			headers.append("Link", link);
		}
	}

	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(chunk);
			}
			if (ended) {
				controller.close();
			}
		},
		async pull(controller) {
			const { done, value } = await reader.read();
			if (done) {
				controller.close();
			} else {
				controller.enqueue(value);
			}
		},
		cancel(reason) {
			return reader.cancel(reason);
		},
	});

	return new Response(body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
