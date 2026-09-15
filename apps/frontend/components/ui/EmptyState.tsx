import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** `panel` for page-level states, `inline` inside sections and lanes. */
  variant?: "panel" | "inline";
  headingLevel?: "h2" | "h3";
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  actions,
  variant = "panel",
  headingLevel = "h2",
  className,
}: EmptyStateProps) {
  const Heading = headingLevel;
  const panel = variant === "panel";

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        panel
          ? "rounded-panel border border-border bg-surface px-6 py-12 shadow-card sm:px-10 sm:py-14"
          : "px-4 py-8",
        className
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={cn(
            "mb-4 flex items-center justify-center rounded-card bg-brand-soft text-brand",
            panel ? "size-12 [&_svg]:size-6" : "size-10 [&_svg]:size-5"
          )}
        >
          {icon}
        </div>
      )}
      <Heading className={cn("font-bold text-text", panel ? "text-lg" : "text-sm")}>{title}</Heading>
      {description && (
        <p className={cn("mt-1.5 max-w-sm text-text-muted", panel ? "text-sm leading-6" : "text-[13px] leading-5")}>
          {description}
        </p>
      )}
      {actions && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}
