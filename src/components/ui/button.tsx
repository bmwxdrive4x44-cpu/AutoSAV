import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary-600 text-white shadow-subtle hover:bg-primary-700 hover:shadow-subtle-hover": variant === "default",
            "bg-primary-50 text-primary-700 hover:bg-primary-100": variant === "secondary",
            "border ui-border-color bg-surface text-slate-700 hover:bg-slate-50": variant === "outline",
            "text-slate-600 hover:bg-slate-100": variant === "ghost",
            "bg-danger-500 text-white hover:bg-danger-700": variant === "destructive",
            "h-9 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-11 px-8 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };

