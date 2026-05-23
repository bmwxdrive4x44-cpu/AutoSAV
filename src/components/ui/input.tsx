import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-surface/80 px-4 py-2.5 text-sm text-foreground backdrop-blur-sm",
          "placeholder:text-muted",
          "transition-all duration-300 ease-soft",
          "focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20",
          "hover:border-border-accent hover:bg-surface",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };
