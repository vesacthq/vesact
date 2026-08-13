import * as React from "react";

import { cn } from "../lib";

export type SwitchProps = Omit<React.ComponentProps<"button">, "onClick" | "role" | "type"> & {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export function Switch({
	checked,
	onCheckedChange,
	disabled,
	className,
	id,
	"aria-label": ariaLabel,
	...props
}: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			id={id}
			aria-checked={checked}
			aria-label={ariaLabel}
			disabled={disabled}
			onClick={() => {
				if (!disabled) {
					onCheckedChange(!checked);
				}
			}}
			className={cn(
				"h-6 w-11 p-0.5 relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
				checked ? "bg-touch" : "bg-input",
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					"size-5 shadow-lg pointer-events-none block rounded-full bg-background ring-0 transition-transform",
					checked ? "translate-x-4" : "translate-x-0",
				)}
			/>
		</button>
	);
}
