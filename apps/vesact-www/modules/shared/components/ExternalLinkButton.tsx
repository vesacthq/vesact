import { Button } from "@repo/ui/components/button";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";

/** A Button rendered as a plain anchor, for links that leave the router (the console, the docs). */
export function ExternalLinkButton({
	href,
	children,
	...props
}: Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & { href: string }) {
	return (
		<Button
			{...props}
			nativeButton={false}
			render={(renderProps) => {
				const { children: linkChildren, ...rest } = renderProps;
				return (
					<a href={href} {...(rest as unknown as ComponentPropsWithoutRef<"a">)}>
						{linkChildren}
					</a>
				);
			}}
		>
			{children}
		</Button>
	);
}
