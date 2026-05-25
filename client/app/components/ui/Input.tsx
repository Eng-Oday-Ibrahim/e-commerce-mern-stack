import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full h-12 rounded border border-black/10 bg-white px-4 text-sm text-deep-black placeholder:text-warm-gray outline-none transition-all duration-300",
          "focus:border-gold focus:ring-2 focus:ring-gold/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };