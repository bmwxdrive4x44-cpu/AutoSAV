import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "priority-high" | "priority-normal" | "priority-low";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "border-transparent bg-primary-600 text-white",
    secondary: "border-transparent bg-slate-100 text-slate-700",
    success: "border-transparent bg-success-50 text-success-700",
    warning: "border-transparent bg-warning-50 text-warning-700",
    destructive: "border-transparent bg-danger-50 text-danger-700",
    "priority-high": "border-transparent bg-danger-50 text-danger-700",
    "priority-normal": "border-transparent bg-warning-50 text-warning-700",
    "priority-low": "border-transparent bg-primary-50 text-primary-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

