import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** Required: icon-only controls need an accessible name. */
  label: string;
  variant?: "ghost" | "secondary";
  size?: "sm" | "md";
};

const variants = {
  ghost: "text-text-muted hover:not-disabled:bg-surface-muted hover:not-disabled:text-text",
  secondary:
    "border border-border bg-surface text-text-muted shadow-xs hover:not-disabled:border-border-strong hover:not-disabled:text-text",
};

const sizes = {
  sm: "size-9 sm:size-8 [&_svg]:size-4",
  md: "size-11 sm:size-10 [&_svg]:size-[18px]",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = "ghost", size = "md", className, type = "button", title, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-control transition-colors duration-150 ease-calm",
        "disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default IconButton;
