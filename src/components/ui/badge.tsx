import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "priority-high" | "priority-normal" | "priority-low" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-accent/15 text-accent border border-accent/25",
    secondary: "bg-surface-elevated text-foreground-secondary border border-border",
    success: "bg-success/15 text-success border border-success/25",
    warning: "bg-warning/15 text-warning border border-warning/25",
    destructive: "bg-danger/15 text-danger border border-danger/25",
    "priority-high": "bg-danger/15 text-danger border border-danger/25",
    "priority-normal": "bg-warning/15 text-warning border border-warning/25",
    "priority-low": "bg-primary/15 text-primary border border-primary/25",
    outline: "bg-transparent text-foreground-secondary border border-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
