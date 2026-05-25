"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ToggleProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
  /** Screen reader label for the switch */
  "aria-label"?: string;
  /** Visible label on the left */
  label?: string;
  /** Shown when checked vs unchecked (e.g. Active / Inactive) */
  onLabel?: string;
  offLabel?: string;
};

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onCheckedChange, disabled, id, "aria-label": ariaLabel, label, onLabel, offLabel },
  ref
) {
  return (
    <div className="inline-flex items-center gap-2">
      {label ? <span className="text-xs text-black/70 whitespace-nowrap">{label}</span> : null}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? (checked ? onLabel ?? "On" : offLabel ?? "Off")}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onCheckedChange(!checked);
        }}
        className={cn(
          "relative h-6.5 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
          checked ? "border-gold/50 bg-gold/80" : "border-gray-100 bg-gray-200",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow border border-black/10 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {(onLabel || offLabel) && (
        <span className="text-xs font-medium uppercase tracking-wide text-black/70 min-w-[4.5rem]">
          {checked ? onLabel ?? "On" : offLabel ?? "Off"}
        </span>
      )}
    </div>
  );
});
