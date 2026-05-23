import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
          {
            // Accent (Primary CTA) - Coral/Orange
            "bg-accent text-white shadow-[0_4px_14px_rgba(255,107,74,0.35)] hover:bg-accent-hover hover:shadow-[0_6px_20px_rgba(255,107,74,0.45)] hover:-translate-y-0.5 active:translate-y-0": variant === "default" || variant === "accent",
            
            // Secondary - Subtle background
            "bg-surface-elevated text-foreground border border-border hover:bg-surface-hover hover:border-border-accent": variant === "secondary",
            
            // Outline - Glass effect
            "border border-border bg-transparent text-foreground backdrop-blur-sm hover:bg-surface/50 hover:border-accent/30": variant === "outline",
            
            // Ghost - Minimal
            "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated/50": variant === "ghost",
            
            // Destructive
            "bg-danger text-white hover:bg-danger/90 shadow-[0_4px_14px_rgba(248,113,113,0.25)]": variant === "destructive",
            
            // Sizes
            "h-10 px-5 py-2.5 text-sm": size === "default",
            "h-9 px-4 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
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
