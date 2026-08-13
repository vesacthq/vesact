import { useLocalePathname } from "@i18n/routing";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

export function TabGroup({
	items,
	className,
}: {
	items: { label: string; href: string; segment: string }[];
	className?: string;
}) {
	const pathname = useLocalePathname();
	const activeItem = useMemo(() => {
		return items.find(
			(item) =>
				pathname === item.href ||
				pathname.endsWith(`/${item.segment}`) ||
				pathname.includes(`/${item.segment}/`),
		);
	}, [items, pathname]);

	return (
		<div className={`flex border-b-2 ${className}`}>
			{items.map((item) => (
				<Link
					key={item.href}
					to={item.href}
					className={`-mb-0.5 px-6 py-3 block border-b-2 ${
						item === activeItem ? "font-bold border-touch text-touch" : "border-transparent"
					}`}
				>
					{item.label}
				</Link>
			))}
		</div>
	);
}
