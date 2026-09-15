"use client";

import { Check } from "lucide-react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Extra label classes. When given, it must also set the text colour. */
  labelClassName?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, labelClassName, id: idProp, ...props },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("flex min-w-0 items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex size-5 shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-describedby={descriptionId}
          className={cn(
            "peer size-5 appearance-none rounded-md border border-border-strong bg-surface shadow-xs",
            "transition-colors duration-150 ease-calm hover:enabled:border-brand",
            "checked:border-brand checked:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          )}
          {...props}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto size-3.5 text-on-brand opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
        />
      </span>
      <span className="min-w-0 flex-1">
        <label htmlFor={id} className={cn("block text-sm font-medium leading-6", labelClassName ?? "text-text")}>
          {label}
        </label>
        {description && (
          <span id={descriptionId} className="block text-xs leading-5 text-text-muted">
            {description}
          </span>
        )}
      </span>
    </div>
  );
});

export default Checkbox;
