import { logger } from "@repo/logs";
import { AwsClient } from "aws4fetch";

import { config } from "../../config";
import type { GetSignedUploadUrlHandler, GetSignedUrlHander } from "../../types";

// The AWS SDK cannot construct a client on workerd, so signing is done with
// aws4fetch, which is built on fetch and WebCrypto.
let client: AwsClient | null = null;

function getClient() {
	if (client) {
		return client;
	}

	const accessKeyId = process.env.S3_ACCESS_KEY_ID;
	if (!accessKeyId) {
		throw new Error("Missing env variable S3_ACCESS_KEY_ID");
	}

	const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
	if (!secretAccessKey) {
		throw new Error("Missing env variable S3_SECRET_ACCESS_KEY");
	}

	client = new AwsClient({
		accessKeyId,
		secretAccessKey,
		service: "s3",
		// `"auto"` is what Cloudflare R2 expects; AWS S3 requires an explicit
		// region and will reject requests with region=auto. Callers should set
		// `S3_REGION` explicitly when running against AWS.
		region: process.env.S3_REGION ?? "auto",
	});

	return client;
}

function objectUrl(bucketName: string, path: string, expiresIn: number) {
	const endpoint = process.env.S3_ENDPOINT;
	if (!endpoint) {
		throw new Error("Missing env variable S3_ENDPOINT");
	}

	// Each segment is escaped on its own: `encodeURIComponent` over the whole
	// path would turn a prefixed key into one flat, differently named object.
	const key = path.split("/").map(encodeURIComponent).join("/");
	const url = new URL(`${endpoint.replace(/\/+$/, "")}/${bucketName}/${key}`);
	url.searchParams.set("X-Amz-Expires", String(expiresIn));

	return url;
}

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp",
	svg: "image/svg+xml",
};

function getContentTypeFromPath(path: string): string {
	const ext = path.split(".").pop()?.toLowerCase() ?? "";
	return CONTENT_TYPE_BY_EXTENSION[ext] ?? "application/octet-stream";
}

export const getSignedUploadUrl: GetSignedUploadUrlHandler = async (path, { bucket }) => {
	const url = objectUrl(config.bucketNames[bucket], path, 300);

	try {
		// Signing the `Content-Type` means the store rejects uploads whose MIME
		// type doesn't match, which prevents callers from smuggling non-image
		// content past our extension-based checks. Callers MUST set the
		// `Content-Type` header on the PUT request to this exact value.
		//
		// For per-bucket size caps, configure a bucket policy with a
		// `s3:content-length-range` condition or use a presigned POST
		// (presigned PUT URLs cannot bind an arbitrary max length).
		const signed = await getClient().sign(url.toString(), {
			method: "PUT",
			headers: { "content-type": getContentTypeFromPath(path) },
			// `allHeaders` is what puts `content-type` in the signature; without
			// it aws4fetch signs the host alone and the pin above does nothing.
			aws: { signQuery: true, allHeaders: true },
		});

		return signed.url;
	} catch (e) {
		logger.error(e);

		throw new Error("Could not get signed upload url");
	}
};

export const getSignedUrl: GetSignedUrlHander = async (path, { bucket, expiresIn }) => {
	const bucketName = config.bucketNames[bucket];

	if (!bucketName) {
		throw new Error("Invalid bucket");
	}

	const url = objectUrl(bucketName, path, expiresIn ?? 3600);

	try {
		const signed = await getClient().sign(url.toString(), {
			method: "GET",
			aws: { signQuery: true },
		});

		return signed.url;
	} catch (e) {
		logger.error(e);

		throw new Error("Could not get signed url");
	}
};
