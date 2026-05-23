import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "priority-high" | "priority-normal" | "priority-low" | "outline" | "highlight" | "sky";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-accent-soft text-accent border border-accent/20",
    secondary: "bg-surface text-muted border border-border",
    success: "bg-success-soft text-success border border-success/20",
    warning: "bg-warning-soft text-warning border border-warning/20",
    destructive: "bg-danger-soft text-danger border border-danger/20",
    "priority-high": "bg-danger-soft text-danger border border-danger/20",
    "priority-normal": "bg-warning-soft text-warning border border-warning/20",
    "priority-low": "bg-sky-soft text-sky border border-sky/20",
    outline: "bg-transparent text-muted border border-border",
    highlight: "bg-highlight-soft text-highlight border border-highlight/20",
    sky: "bg-sky-soft text-sky border border-sky/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
