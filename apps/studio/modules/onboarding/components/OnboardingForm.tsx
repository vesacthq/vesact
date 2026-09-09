import { getSafeRedirectPath } from "@auth/lib/redirects";
import { useTranslations } from "@i18n/intl";
import { authClient } from "@repo/auth/client";
import { Progress } from "@repo/ui/components/progress";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { withQuery } from "ufo";

import { OnboardingAccountStep } from "./OnboardingAccountStep";

interface OnboardingSearch {
	redirectTo?: string;
	step?: string;
}

export function OnboardingForm() {
	const t = useTranslations();
	const router = useRouter();
	const search = useSearch({ strict: false }) as OnboardingSearch;

	const stepSearchParam = search.step;
	const redirectTo = search.redirectTo;

	// oxlint-disable-next-line no-unused-vars -- used for redirecting to the next step
	const setStep = (step: number) => {
		void router.navigate({
			to: withQuery(window.location.pathname, {
				...search,
				step,
			}),
			replace: true,
		});
	};

	const onCompleted = async () => {
		await authClient.updateUser({
			onboardingComplete: true,
		});

		void router.navigate({ to: getSafeRedirectPath(redirectTo, "/"), replace: true });
	};

	const steps = useMemo(() => {
		const allSteps: { component: React.ReactNode }[] = [
			{
				component: <OnboardingAccountStep onCompleted={() => onCompleted()} />,
			},
		];

		return allSteps;
	}, []); // oxlint-disable-line eslint-plugin-react-hooks/exhaustive-deps

	const parsedStep = stepSearchParam ? Number.parseInt(stepSearchParam, 10) : 1;
	const onboardingStep =
		Number.isInteger(parsedStep) && parsedStep >= 1 && parsedStep <= steps.length ? parsedStep : 1;

	return (
		<div>
			<h1 className="font-bold text-xl md:text-2xl">{t("onboarding.title")}</h1>
			<p className="mt-2 mb-6 text-foreground/60">{t("onboarding.message")}</p>

			{steps.length > 1 && (
				<div className="mb-6 gap-3 flex items-center">
					<Progress value={(onboardingStep / steps.length) * 100} className="w-full" />
					<span className="text-xs shrink-0 text-foreground/60">
						{t("onboarding.step", {
							step: onboardingStep,
							total: steps.length,
						})}
					</span>
				</div>
			)}

			{steps[onboardingStep - 1].component}
		</div>
	);
}
