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
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            // Default/Accent - Forest green
            "rounded-full bg-accent text-white shadow-travel hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0": variant === "default" || variant === "accent",
            
            // Secondary - Light surface
            "rounded-full bg-surface text-foreground border border-border hover:bg-surface-hover hover:border-accent/30": variant === "secondary",
            
            // Outline - Border only
            "rounded-full border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-white": variant === "outline",
            
            // Ghost - Minimal
            "rounded-full text-muted hover:text-foreground hover:bg-surface-hover": variant === "ghost",
            
            // Destructive
            "rounded-full bg-danger text-white hover:bg-danger/90": variant === "destructive",
            
            // Sizes
            "h-10 px-5 py-2.5 text-sm": size === "default",
            "h-9 px-4 text-sm": size === "sm",
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
