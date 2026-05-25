import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[140px] rounded-md border border-black/10 bg-white px-4 py-3 text-sm text-deep-black placeholder:text-warm-gray outline-none resize-none transition-all duration-300",
        "focus:border-gold focus:ring-2 focus:ring-gold/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";

export { TextArea };