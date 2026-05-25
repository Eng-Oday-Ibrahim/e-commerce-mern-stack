import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "default"
  | "gold"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "ghost";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-black text-white",
  gold: "bg-gold text-black",
  outline: "border border-black/20 text-black",
  success: "bg-green-500/10 text-green-600",
  warning: "bg-yellow-500/10 text-yellow-700",
  danger: "bg-red-500/10 text-red-600",
  ghost: "bg-black/5 text-black",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}