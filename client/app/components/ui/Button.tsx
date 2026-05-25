import * as React from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-gold text-black hover:opacity-90",
    
  secondary:
    "bg-deep-black text-white hover:bg-black",

  outline:
    "border border-gold text-deep-black hover:bg-gold hover:text-black",

  ghost:
    "hover:bg-black/5",

  link:
    "underline underline-offset-4 hover:opacity-70",

  destructive:
    "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  xs: "h-7 px-2 text-xs",
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  icon: "h-11 w-11",
};

const href = {
  default: "",
}
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium tracking-[0.08em] uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";