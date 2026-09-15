"use client";

import { ChevronDown, CircleAlert } from "lucide-react";
import { createContext, forwardRef, useContext, useId } from "react";
import { cn } from "@/lib/cn";

type FieldContextValue = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

type FieldProps = {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** Shows a quiet "Optional" marker next to the label. */
  optional?: boolean;
  /** Visually hide the label while keeping it available to assistive tech. */
  hideLabel?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wires a label, hint and error message to the control rendered inside it.
 * `Input`, `Textarea` and `Select` pick up the generated ids automatically.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  optional = false,
  hideLabel,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
      <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
        <label
          htmlFor={id}
          className={cn("flex items-baseline gap-1.5 text-[13px] font-semibold text-text", hideLabel && "sr-only")}
        >
          {label}
          {optional && <span className="text-xs font-medium text-text-muted">Optional</span>}
        </label>
        {children}
        {hint && !error && (
          <p id={hintId} className="text-xs leading-5 text-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="flex items-start gap-1.5 text-xs font-medium leading-5 text-danger">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

function useFieldControl<T extends { id?: string; "aria-describedby"?: string; "aria-invalid"?: React.AriaAttributes["aria-invalid"]; required?: boolean }>(
  props: T
) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field?.id,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid ? true : undefined),
    required: props.required ?? field?.required,
  };
}

const controlBase =
  "w-full min-w-0 rounded-control border border-border-strong bg-surface text-sm text-text shadow-xs " +
  "transition-[border-color,box-shadow] duration-150 ease-calm " +
  "hover:enabled:border-text-subtle " +
  "focus-visible:border-focus focus-visible:shadow-[0_0_0_3px_var(--color-focus-halo)] focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted " +
  "aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_3px_var(--color-danger-halo)]";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Optional leading icon, rendered inside the control. */
  leadingIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leadingIcon, ...props },
  ref
) {
  const control = useFieldControl(props);
  const input = (
    <input
      ref={ref}
      {...props}
      {...control}
      className={cn(controlBase, "h-11 px-3 sm:h-10", leadingIcon ? "pl-9" : undefined, !leadingIcon && className)}
    />
  );

  if (!leadingIcon) return input;

  return (
    <div className={cn("relative min-w-0", className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-subtle [&_svg]:size-4"
      >
        {leadingIcon}
      </span>
      {input}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    const control = useFieldControl(props);
    return (
      <textarea
        ref={ref}
        {...props}
        {...control}
        className={cn(controlBase, "min-h-24 resize-y px-3 py-2.5 leading-6", className)}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    const control = useFieldControl(props);
    return (
      <div className={cn("relative min-w-0", className)}>
        <select
          ref={ref}
          {...props}
          {...control}
          className={cn(controlBase, "h-11 appearance-none truncate pl-3 pr-9 sm:h-10")}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
        />
      </div>
    );
  }
);
