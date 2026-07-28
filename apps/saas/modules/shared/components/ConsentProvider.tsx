import Cookies from "js-cookie";
import { createContext, useState } from "react";

const CONSENT_COOKIE_NAME = "consent";

export const ConsentContext = createContext<{
	userHasConsented: boolean;
	userHasResponded: boolean;
	allowCookies: () => void;
	declineCookies: () => void;
}>({
	userHasConsented: false,
	userHasResponded: false,
	allowCookies: () => {},
	declineCookies: () => {},
});

function readConsentCookie() {
	const value = Cookies.get(CONSENT_COOKIE_NAME);
	return value === undefined ? undefined : value === "true";
}

export function ConsentProvider({
	children,
	initialConsent,
}: {
	children: React.ReactNode;
	initialConsent?: boolean;
}) {
	// undefined means the user hasn't made a choice yet, so the banner is shown.
	const [consent, setConsent] = useState<boolean | undefined>(
		() => initialConsent ?? readConsentCookie(),
	);

	const allowCookies = () => {
		Cookies.set(CONSENT_COOKIE_NAME, "true", { expires: 30 });
		setConsent(true);
	};

	const declineCookies = () => {
		Cookies.set(CONSENT_COOKIE_NAME, "false", { expires: 30 });
		setConsent(false);
	};

	return (
		<ConsentContext.Provider
			value={{
				userHasConsented: consent === true,
				userHasResponded: consent !== undefined,
				allowCookies,
				declineCookies,
			}}
		>
			{children}
		</ConsentContext.Provider>
	);
}
