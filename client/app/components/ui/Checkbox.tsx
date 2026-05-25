import * as React from "react";
import { cn } from "@/lib/utils/cn";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  indeterminate?: boolean;
};

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ className, indeterminate, ...props }, ref) => {
  const innerRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type="checkbox"
      className={cn(
        "h-4 w-4 accent-gold cursor-pointer",
        className
      )}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";