import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import Spinner from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-ghost"
  | "inverse"
  | "inverse-ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold " +
  "transition-[background-color,border-color,color,box-shadow] duration-150 ease-calm " +
  "disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 " +
  "[&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand shadow-xs hover:not-disabled:bg-brand-hover active:not-disabled:bg-brand-hover",
  secondary:
    "border border-border bg-surface text-text shadow-xs hover:not-disabled:border-border-strong hover:not-disabled:bg-surface-muted",
  ghost: "text-text-muted hover:not-disabled:bg-surface-muted hover:not-disabled:text-text",
  danger: "bg-danger text-on-brand shadow-xs hover:not-disabled:bg-danger-hover",
  "danger-ghost": "text-danger hover:not-disabled:bg-danger-soft hover:not-disabled:text-danger-ink",
  /** For dark evergreen surfaces. */
  inverse: "bg-surface text-brand-ink shadow-xs hover:not-disabled:bg-brand-soft",
  "inverse-ghost": "text-on-brand hover:not-disabled:bg-on-brand/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px] sm:h-8",
  md: "h-11 px-4 text-sm sm:h-10",
  lg: "h-12 px-5 text-[15px]",
};

/** Class names for anything that should look like a button, e.g. a `<Link>`. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and announces the busy state. */
  loading?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className, children, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});

export default Button;
