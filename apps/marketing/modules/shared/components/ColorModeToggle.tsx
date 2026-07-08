import { cn, useTheme } from "@repo/ui";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { MoonIcon, SunIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTranslations } from "use-intl";

function subscribeToPrefersColorScheme(onStoreChange: () => void) {
	const media = window.matchMedia("(prefers-color-scheme: dark)");
	media.addEventListener("change", onStoreChange);
	return () => media.removeEventListener("change", onStoreChange);
}

function getPrefersColorSchemeSnapshot(): "light" | "dark" {
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ColorModeToggle() {
	const { setTheme, theme } = useTheme();
	const t = useTranslations("common.colorMode");
	const systemAppearance = useSyncExternalStore<"light" | "dark">(
		subscribeToPrefersColorScheme,
		getPrefersColorSchemeSnapshot,
		() => "light",
	);

	const activeMode: "light" | "dark" =
		theme === "system" ? systemAppearance : theme === "dark" ? "dark" : "light";

	const colorModeOptions = [
		{
			value: "light" as const,
			icon: SunIcon,
			label: t("light"),
		},
		{
			value: "dark" as const,
			icon: MoonIcon,
			label: t("dark"),
		},
	];

	const activeIndex = colorModeOptions.findIndex((option) => option.value === activeMode);

	return (
		<TooltipProvider delay={0}>
			<div
				className="gap-0 p-0.5 relative inline-flex items-center rounded-full bg-muted"
				data-test="color-mode-toggle"
			>
				{/* Active indicator */}
				<div
					className="left-0.5 top-0.5 h-7 w-7 shadow-sm ease-in-out absolute rounded-full border border-border bg-background transition-transform duration-200"
					style={{
						transform: `translateX(${activeIndex * 100}%)`,
					}}
					aria-hidden="true"
				/>

				{colorModeOptions.map((option) => {
					const Icon = option.icon;
					const isActive = option.value === activeMode;
					const label = option.label;

					return (
						<Tooltip key={option.value}>
							<TooltipTrigger
								render={
									<button
										type="button"
										onClick={() => setTheme(option.value)}
										className={cn(
											"h-7 w-7 relative z-10 flex items-center justify-center rounded-full transition-colors",
											"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
											isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
										)}
										data-test={`color-mode-toggle-item-${option.value}`}
										aria-label={`${label} mode`}
										aria-pressed={isActive}
									>
										<Icon className="size-3.5" />
									</button>
								}
							/>
							<TooltipContent>{label}</TooltipContent>
						</Tooltip>
					);
				})}
			</div>
		</TooltipProvider>
	);
}
