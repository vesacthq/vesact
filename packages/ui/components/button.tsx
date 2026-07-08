import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib";
import { Spinner } from "./spinner";

const buttonVariants = cva(
	"flex items-center justify-center font-medium enabled:cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&>svg]:mr-1.5 [&>svg+svg]:hidden",
	{
		variants: {
			variant: {
				primary: "bg-primary text-primary-foreground hover:bg-[var(--button-hover-primary)]",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-[var(--button-hover-secondary)]",
				outline: "border bg-transparent text-secondary hover:bg-[var(--button-hover-transparent)]",
				ghost: "text-foreground hover:bg-[var(--button-hover-transparent)] hover:text-foreground",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-[var(--button-hover-destructive)]",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-6 rounded-full px-3 text-xs",
				md: "h-9 rounded-full px-4 text-sm",
				lg: "h-12 rounded-full px-6 text-base",
				icon: "size-8 rounded-full [&>svg]:m-0 [&>svg]:opacity-100",
			},
		},
		defaultVariants: {
			variant: "secondary",
			size: "md",
		},
	},
);

export type ButtonRenderProps = React.HTMLAttributes<HTMLElement> & {
	/** Intentionally loose so composed elements (`<a>`, router links, etc.) accept refs. */
	ref?: React.Ref<unknown>;
	disabled?: boolean;
	type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
	VariantProps<typeof buttonVariants> & {
		loading?: boolean;
		children?: React.ReactNode;
		/**
		 * Compose styles and behavior onto a custom element (e.g. `<a>` or router `Link`).
		 * Spread the received props onto the root element.
		 */
		render?: (props: ButtonRenderProps) => React.ReactElement;
	};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, children, variant, size, loading, disabled, render, ...props },
	ref,
) {
	const mergedClassName = cn(buttonVariants({ variant, size, className }));
	const isDisabled = Boolean(disabled || loading);

	if (render) {
		return render({
			...props,
			ref: ref as React.Ref<unknown>,
			className: mergedClassName,
			disabled: isDisabled,
			children: (
				<>
					{loading && <Spinner className="mr-1.5 size-4 text-inherit" />}
					{children}
				</>
			),
		});
	}

	return (
		<button ref={ref} type="button" className={mergedClassName} disabled={isDisabled} {...props}>
			{loading && <Spinner className="mr-1.5 size-4 text-inherit" />}
			{children}
		</button>
	);
});

Button.displayName = "Button";

export { Button, buttonVariants };
