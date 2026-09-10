import { getTrustedOrigins } from "@repo/utils";
import { z } from "zod";

const allowedRedirectOrigins = getTrustedOrigins().map((url) => new URL(url).origin);

function isAllowedRedirectUrl(redirectUrl: string) {
	try {
		return allowedRedirectOrigins.includes(new URL(redirectUrl).origin);
	} catch {
		return false;
	}
}

export const paymentRedirectUrlSchema = z
	.url()
	.refine(isAllowedRedirectUrl, {
		message: "Redirect URL must use one of the application origins",
	})
	.optional();
