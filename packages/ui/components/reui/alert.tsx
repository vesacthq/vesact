import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib";

const alertVariants = cva(
	[
		"relative w-full text-sm border has-[>svg]:grid-cols-[calc(var(--spacing)*3)_1fr] grid-cols-[0_1fr] grid gap-y-0.5 items-center [&>svg:not([class*=size-])]:size-4",
		"has-[>[data-slot=alert-title]+[data-slot=alert-description]]:[&_[data-slot=alert-action]]:sm:row-end-3",
		"has-[>[data-slot=alert-title]+[data-slot=alert-description]]:items-start",
		"has-[>[data-slot=alert-title]+[data-slot=alert-description]]:[&_svg]:translate-y-0.5",
		"rounded-lg",
		"px-3",
		"py-2.5",
		"has-[>svg]:gap-x-2.5",
	],
	{
		variants: {
			variant: {
				default: "bg-card text-card-foreground",
				destructive: "border-destructive/30 bg-destructive/4 [&>svg]:text-destructive",
				info: "border-info/30 bg-info/4 [&>svg]:text-info",
				success: "border-success/30 bg-success/4 [&>svg]:text-success",
				warning: "border-warning/30 bg-warning/4 [&>svg]:text-warning",
				invert:
					"border-invert bg-invert text-invert-foreground [&_[data-slot=alert-description]]:text-invert-foreground/70",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn("min-h-4 font-medium tracking-tight col-start-2 line-clamp-1", className)}
			{...props}
		/>
	);
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"gap-1 text-sm [&_p]:leading-relaxed col-start-2 grid justify-items-start text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-action"
			className={cn(
				"gap-1.5 max-sm:col-start-2 max-sm:mt-2 max-sm:justify-start sm:col-start-3 sm:row-start-1 sm:justify-end sm:self-center flex",
				className,
			)}
			{...props}
		/>
	);
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
