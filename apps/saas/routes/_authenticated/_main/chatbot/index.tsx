import { AiChat } from "@ai/components/AiChat";
import { config } from "@config";
import { useTranslations } from "@i18n/intl";
import { PageHeader } from "@shared/components/PageHeader";
import { documentTitle } from "@shared/lib/document-title";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_main/chatbot/")({
	beforeLoad: () => {
		if (!config.enableAiDemo) {
			throw redirect({ href: "/" });
		}
	},
	component: ChatbotPage,
	head: () => ({ meta: [{ title: documentTitle("AI Chat") }] }),
});

function ChatbotPage() {
	const t = useTranslations();

	return (
		<div>
			<PageHeader title={t("app.menu.aiChatbot")} subtitle={t("start.subtitle")} />
			<div className="mt-4">
				<AiChat />
			</div>
		</div>
	);
}
