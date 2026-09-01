import { logger } from "@repo/logs";

import type { SendEmailHandler } from "../types";

export const send: SendEmailHandler = async (params) => {
	if (process.env.RESEND_API_KEY) {
		return (await import("./resend")).send(params);
	}

	if (process.env.NODE_ENV === "production") {
		throw new Error("RESEND_API_KEY is not set");
	}

	logger.warn("RESEND_API_KEY is not set, logging email to the console instead");
	return (await import("./console")).send(params);
};
