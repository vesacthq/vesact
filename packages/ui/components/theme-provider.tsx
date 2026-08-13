import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}

const ThemeProviderContext = createContext<{
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
}>({
	theme: "system",
	resolvedTheme: "light",
	setTheme: () => null,
});

function isTheme(value: string | null): value is Theme {
	return value === "dark" || value === "light" || value === "system";
}

function resolveTheme(theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme {
	return theme === "system" ? systemTheme : theme;
}

function applyThemeToDocument(resolved: ResolvedTheme): void {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(resolved);
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "ui-theme",
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");

	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (isTheme(stored)) {
				setThemeState(stored);
			}
		} catch {
			// localStorage may be unavailable (private mode, SSR polyfills, etc.)
		}
	}, [storageKey]);

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => {
			setSystemTheme(media.matches ? "dark" : "light");
		};

		onChange();
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	const resolvedTheme = resolveTheme(theme, systemTheme);

	useEffect(() => {
		applyThemeToDocument(resolvedTheme);
	}, [resolvedTheme]);

	const value = useMemo(
		() => ({
			theme,
			resolvedTheme,
			setTheme: (next: Theme) => {
				try {
					if (typeof localStorage !== "undefined") {
						localStorage.setItem(storageKey, next);
					}
				} catch {
					// ignore persistence failures
				}
				setThemeState(next);
			},
		}),
		[theme, resolvedTheme, storageKey],
	);

	return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);
	if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
	return context;
};
