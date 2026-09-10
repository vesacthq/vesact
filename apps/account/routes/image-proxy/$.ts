import { getSignedUrl } from "@repo/storage";
import { config as storageConfig } from "@repo/storage/config";
import { createFileRoute } from "@tanstack/react-router";

const SAFE_IMAGE_KEY = /^[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif)$/i;

function parseImageProxyPath(request: Request) {
	const pathname = new URL(request.url).pathname;
	const rawPath = pathname.replace(/^\/image-proxy\/?/, "");
	const [bucket, ...filePathParts] = rawPath.split("/");

	if (!(bucket && filePathParts.length === 1)) {
		return null;
	}

	try {
		const filePath = decodeURIComponent(filePathParts[0]);

		if (bucket !== storageConfig.bucketNames.avatars || !SAFE_IMAGE_KEY.test(filePath)) {
			return null;
		}

		return filePath;
	} catch {
		return null;
	}
}

export const Route = createFileRoute("/image-proxy/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const filePath = parseImageProxyPath(request);

				if (!filePath) {
					return new Response("Invalid path", { status: 400 });
				}

				const signedUrl = await getSignedUrl(filePath, {
					bucket: "avatars",
					expiresIn: 60 * 60,
				});

				return new Response(null, {
					status: 302,
					headers: {
						Location: signedUrl,
						"Cache-Control": "max-age=3600",
					},
				});
			},
		},
	},
});
