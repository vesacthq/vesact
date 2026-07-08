import { config } from "@config";
import { LocaleLink } from "@i18n/routing";
import { getCurrentLocale } from "@repo/i18n/runtime";
import { config as paymentsConfig } from "@repo/payments/config";
import type { PaidPlan } from "@repo/payments/types";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ArrowRightIcon, BadgePercentIcon, CheckIcon, StarIcon } from "lucide-react";
import { useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { useTranslations } from "use-intl";

type Translator = ReturnType<typeof useTranslations>;

function productFeatures(t: Translator, planId: string): string[] {
	switch (planId) {
		case "free":
			return [
				t("products.free.features.anotherFeature"),
				t("products.free.features.limitedSupport"),
			];
		case "basic":
			return [
				t("products.basic.features.anotherFeature"),
				t("products.basic.features.limitedSupport"),
			];
		case "pro":
			return [
				t("products.pro.features.anotherFeature"),
				t("products.pro.features.fiveMembers"),
				t("products.pro.features.fullSupport"),
			];
		case "enterprise":
			return [
				t("products.enterprise.features.enterpriseSupport"),
				t("products.enterprise.features.unlimitedProjects"),
			];
		case "lifetime":
			return [
				t("products.lifetime.features.extendSupport"),
				t("products.lifetime.features.noRecurringCosts"),
			];
		default:
			return [];
	}
}

function productTitle(t: Translator, planId: string): string {
	switch (planId) {
		case "free":
			return t("products.free.title");
		case "basic":
			return t("products.basic.title");
		case "pro":
			return t("products.pro.title");
		case "enterprise":
			return t("products.enterprise.title");
		case "lifetime":
			return t("products.lifetime.title");
		default:
			return planId;
	}
}

function productDescription(t: Translator, planId: string): string {
	switch (planId) {
		case "free":
			return t("products.free.description");
		case "basic":
			return t("products.basic.description");
		case "pro":
			return t("products.pro.description");
		case "enterprise":
			return t("products.enterprise.description");
		case "lifetime":
			return t("products.lifetime.description");
		default:
			return "";
	}
}

export function PricingSection() {
	const t = useTranslations("pricing");
	const locale = getCurrentLocale();
	const [interval, setBillingInterval] = useState<"month" | "year">("month");

	const signupUrl = useMemo(
		() => config.saasUrl && `${String(config.saasUrl).replace(/\/$/, "")}/signup`,
		[],
	);

	const plans = useMemo(() => {
		const result: Array<{
			id: string;
			title: string;
			description: string;
			features: string[];
			cta: string;
			recommended?: boolean;
			isEnterprise?: boolean;
			prices?: PaidPlan["prices"];
			to: string;
		}> = [];

		if (!paymentsConfig.requireActiveSubscription) {
			result.push({
				id: "free",
				title: productTitle(t, "free"),
				description: productDescription(t, "free"),
				features: productFeatures(t, "free"),
				cta: t("getStarted"),
				to: signupUrl ?? "#",
			});
		}

		for (const [planId, plan] of Object.entries(paymentsConfig.plans)) {
			const isEnterprise = "isEnterprise" in plan;
			const prices = "prices" in plan ? (plan as PaidPlan).prices : undefined;

			result.push({
				id: planId,
				title: productTitle(t, planId),
				description: productDescription(t, planId),
				features: productFeatures(t, planId),
				cta: isEnterprise ? t("contactSales") : t("getStarted"),
				recommended: plan.recommended,
				isEnterprise,
				prices,
				to: signupUrl ?? "#",
			});
		}

		return result;
	}, [signupUrl, t]);

	const hasSubscriptions = plans.some((p) =>
		p.prices?.some((price) => price.type === "subscription"),
	);

	return (
		<section id="pricing" className="scroll-mt-16 py-12 lg:py-16 border-y">
			<div className="container">
				<div className="mb-6 max-w-3xl mx-auto text-center">
					<h1 className="font-medium text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight text-foreground">
						{t("title")}
					</h1>
					<p className="mt-2 text-sm sm:text-lg text-foreground/60">{t("description")}</p>
				</div>

				<div className="@container">
					{hasSubscriptions && (
						<div className="mb-8 flex justify-center">
							<Tabs
								value={interval}
								onValueChange={(value) => setBillingInterval(value as "month" | "year")}
								data-test="price-table-interval-tabs"
							>
								<TabsList className="border-foreground/10">
									<TabsTrigger value="month">{t("monthly")}</TabsTrigger>
									<TabsTrigger value="year">{t("yearly")}</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					)}
					<div
						className={cn(
							"gap-4 grid grid-cols-1",
							plans.length >= 2 && "@xl:grid-cols-2",
							plans.length >= 3 && "@3xl:grid-cols-3",
							plans.length >= 4 && "@4xl:grid-cols-4",
						)}
					>
						{plans.map((plan) => {
							const isFree = !plan.prices && !plan.isEnterprise;
							const price = isFree
								? undefined
								: plan.prices?.find((p) => p.type === "one-time" || p.interval === interval);
							const trialPeriodDays =
								price && "trialPeriodDays" in price && price.trialPeriodDays
									? price.trialPeriodDays
									: undefined;

							return (
								<div
									key={plan.id}
									className={cn(
										"p-6 relative rounded-3xl border bg-card",
										plan.recommended ? "border-primary" : "border-primary/20",
									)}
									data-test="price-table-plan"
								>
									{plan.recommended && (
										<div className="-top-3 px-2 py-1 font-semibold text-xs absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-primary text-center text-primary-foreground">
											<StarIcon className="mr-1.5 size-3 inline-block" />
											{t("recommended")}
										</div>
									)}
									<div className="gap-4 flex h-full flex-col justify-between">
										<div>
											<h3 className="my-0 font-semibold text-2xl">{plan.title}</h3>
											{plan.description && (
												<div className="prose mt-2 text-sm text-foreground/60">
													{plan.description}
												</div>
											)}

											{!!plan.features?.length && (
												<ul className="mt-4 gap-2 text-sm grid list-none">
													{plan.features.map((feature, key) => (
														<li key={key} className="flex items-center justify-start">
															<CheckIcon className="mr-2 size-4 text-primary" />
															<span>{feature}</span>
														</li>
													))}
												</ul>
											)}

											{trialPeriodDays !== undefined && trialPeriodDays > 0 && (
												<div className="mt-4 font-medium text-sm flex items-center justify-start text-primary opacity-80">
													<BadgePercentIcon className="mr-2 size-4" />
													{t("trialPeriod", {
														days: trialPeriodDays,
													})}
												</div>
											)}
										</div>

										<div>
											{isFree && (
												<strong
													className="font-medium text-2xl lg:text-3xl block"
													data-test="price-table-plan-price"
												>
													{new Intl.NumberFormat(locale, {
														style: "currency",
														currency: "USD",
													}).format(0)}
												</strong>
											)}

											{price && (
												<strong
													className="font-medium text-2xl lg:text-3xl block"
													data-test="price-table-plan-price"
												>
													{new Intl.NumberFormat(locale, {
														style: "currency",
														currency: price.currency,
													}).format(price.amount)}
													{price.type === "subscription" && (
														<span className="font-normal text-xs opacity-60">
															/{price.interval === "year" ? t("year") : t("month")}
														</span>
													)}
												</strong>
											)}

											{plan.to.startsWith("/") ? (
												<Button
													className="mt-4 w-full"
													variant={plan.recommended ? "primary" : "secondary"}
													render={(props) => (
														<LocaleLink href={plan.to} {...(props as Record<string, unknown>)} />
													)}
												>
													{plan.cta}
													<ArrowRightIcon className="ml-2 size-4" />
												</Button>
											) : (
												<Button
													className="mt-4 w-full"
													variant={plan.recommended ? "primary" : "secondary"}
													render={(props) => {
														const { children: linkChildren, ...rest } = props;
														return (
															<a
																href={plan.to}
																{...(rest as unknown as ComponentPropsWithoutRef<"a">)}
															>
																{linkChildren}
															</a>
														);
													}}
												>
													{plan.cta}
													<ArrowRightIcon className="ml-2 size-4" />
												</Button>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
