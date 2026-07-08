/**
 * Shadcn-style form primitives built on top of `@tanstack/react-form`.
 *
 * Usage:
 *
 *   const form = useForm({
 *     defaultValues: { email: "" },
 *     validators: { onSubmit: zodSchema }, // zod 4 is a Standard Schema — no adapter needed
 *     onSubmit: async ({ value }) => { ... },
 *   });
 *
 *   <Form form={form}>
 *     <form
 *       onSubmit={(e) => {
 *         e.preventDefault();
 *         void form.handleSubmit();
 *       }}
 *     >
 *       <FormField name="email">
 *         {(field) => (
 *           <FormItem>
 *             <FormLabel>Email</FormLabel>
 *             <FormControl>
 *               <Input
 *                 value={field.state.value}
 *                 onBlur={field.handleBlur}
 *                 onChange={(e) => field.handleChange(e.target.value)}
 *               />
 *             </FormControl>
 *             <FormMessage />
 *           </FormItem>
 *         )}
 *       </FormField>
 *     </form>
 *   </Form>
 */
import type {
	AnyFieldApi,
	DeepKeys,
	DeepValue,
	FieldValidators,
	ReactFormExtendedApi,
} from "@tanstack/react-form";
import * as React from "react";

import { cn } from "../lib";
import { Label } from "./label";

/**
 * Return type of `useForm()`. Intentionally loose so zod-validated forms and
 * plain ones both pass without a struct of generics.
 */
// biome-ignore lint/suspicious/noExplicitAny: upstream API uses 12 generics
export type FormInstance = ReactFormExtendedApi<
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any,
	any
>;

const FormApiContext = React.createContext<FormInstance | null>(null);

function Form({ form, children }: { form: FormInstance; children: React.ReactNode }) {
	return <FormApiContext.Provider value={form}>{children}</FormApiContext.Provider>;
}

export function useFormContext(): FormInstance {
	const form = React.useContext(FormApiContext);
	if (!form) {
		throw new Error("useFormContext must be used within <Form>");
	}
	return form;
}

type FormFieldContextValue = {
	field: AnyFieldApi;
	name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

type FormFieldProps<
	TFormData,
	TName extends DeepKeys<TFormData>,
	TData extends DeepValue<TFormData, TName>,
> = {
	name: TName;
	validators?: FieldValidators<
		TFormData,
		TName,
		TData,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any,
		// biome-ignore lint/suspicious/noExplicitAny: upstream API
		any
	>;
	children: (field: AnyFieldApi) => React.ReactNode;
};

function FormField<
	TFormData,
	TName extends DeepKeys<TFormData>,
	TData extends DeepValue<TFormData, TName>,
>({ name, validators, children }: FormFieldProps<TFormData, TName, TData>) {
	const form = useFormContext();
	const Field = form.Field;

	return (
		<Field name={name} validators={validators}>
			{(field: AnyFieldApi) => (
				<FormFieldContext.Provider value={{ field, name: String(name) }}>
					{children(field)}
				</FormFieldContext.Provider>
			)}
		</Field>
	);
}

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const id = React.useId();
	return (
		<FormItemContext.Provider value={{ id }}>
			<div className={cn("space-y-2", className)} {...props} />
		</FormItemContext.Provider>
	);
};

function formatFieldErrors(errors: unknown[]): string | undefined {
	if (!errors.length) {
		return undefined;
	}
	const parts: string[] = [];
	for (const e of errors) {
		if (typeof e === "string") {
			parts.push(e);
			continue;
		}
		if (Array.isArray(e)) {
			const joined = formatFieldErrors(e);
			if (joined) {
				parts.push(joined);
			}
			continue;
		}
		if (e && typeof e === "object" && "message" in e) {
			const m = (e as { message?: unknown }).message;
			if (typeof m === "string") {
				parts.push(m);
				continue;
			}
		}
		if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") {
			parts.push(String(e));
			continue;
		}
		if (e != null && typeof e === "object") {
			// Avoid "[object Object]" for unrecognized object shapes.
			parts.push(JSON.stringify(e));
		}
	}
	const joined = parts.filter(Boolean).join(", ");
	return joined || undefined;
}

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);

	if (!fieldContext?.field) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { field, name } = fieldContext;
	const { id } = itemContext;
	const errorMessage = formatFieldErrors(field.state.meta.errors);

	return {
		id,
		name,
		field,
		formItemId: id ? `${id}-form-item` : undefined,
		formDescriptionId: id ? `${id}-form-item-description` : undefined,
		formMessageId: id ? `${id}-form-item-message` : undefined,
		error: errorMessage ? { message: errorMessage } : undefined,
	};
};

const FormLabel = ({ className, ...props }: React.ComponentProps<typeof Label>) => {
	const { error, formItemId } = useFormField();

	return (
		<Label
			className={cn("font-medium block", error && "text-destructive", className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
};

/**
 * Injects `id`, `aria-describedby`, and `aria-invalid` onto its single child so
 * the control is wired to its label and error message.
 */
const FormControl = ({ children }: { children: React.ReactElement }) => {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

	return React.cloneElement(children, {
		id: formItemId,
		"aria-describedby": error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
		"aria-invalid": Boolean(error),
	} as React.Attributes);
};

const FormDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
	const { formDescriptionId } = useFormField();

	return (
		<p id={formDescriptionId} className={cn("text-sm text-foreground/60", className)} {...props} />
	);
};

const FormMessage = ({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error.message) : children;

	if (!body) {
		return null;
	}

	return (
		<p
			id={formMessageId}
			className={cn("font-normal text-sm text-destructive", className)}
			{...props}
		>
			{body}
		</p>
	);
};

export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
};
