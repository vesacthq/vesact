const openIdProviderIssuers: Record<string, string> = {
	google: "https://accounts.google.com",
};

export function getAccountIssuer(providerId: string) {
	if (providerId === "credential") {
		return "local:credential";
	}

	const openIdIssuer = openIdProviderIssuers[providerId];
	if (openIdIssuer) {
		return openIdIssuer;
	}

	return `local:oauth:${encodeURIComponent(providerId)}`;
}
