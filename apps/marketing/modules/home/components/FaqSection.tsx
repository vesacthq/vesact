import { cn } from "@repo/ui";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/accordion";
import { useTranslations } from "use-intl";

const FAQ_ITEMS = [
	{
		question: "items.refundPolicy.question",
		answer: "items.refundPolicy.answer",
	},
	{
		question: "items.cancelSubscription.question",
		answer: "items.cancelSubscription.answer",
	},
	{
		question: "items.changePlan.question",
		answer: "items.changePlan.answer",
	},
	{
		question: "items.freeTrial.question",
		answer: "items.freeTrial.answer",
	},
] as const;

export function FaqSection({ className }: { className?: string }) {
	const t = useTranslations("faq");
	const items = FAQ_ITEMS.map(({ question, answer }) => ({
		question: t(question),
		answer: t(answer),
	}));

	return (
		<section className={cn("scroll-mt-20 py-12 lg:py-16", className)} id="faq">
			<div className="container">
				<div className="gap-6 md:gap-8 lg:gap-12 max-w-2xl mx-auto grid grid-cols-1">
					<div className="text-center">
						<h1 className="font-medium text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight text-foreground">
							{t("title")}
						</h1>
						<p className="text-sm sm:text-lg mt-2 text-foreground/60">{t("description")}</p>
					</div>
					<Accordion className="space-y-2 w-full text-left" defaultValue={[]} multiple={false}>
						{items.map((item, i) => (
							<AccordionItem
								key={`faq-item-${i}`}
								value={`item-${i}`}
								className="px-4 lg:px-6 rounded-lg border bg-card shadow-none"
							>
								<AccordionTrigger className="font-medium text-base text-left hover:no-underline">
									{item.question}
								</AccordionTrigger>
								<AccordionContent className="text-foreground/60">{item.answer}</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}
