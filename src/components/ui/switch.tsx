"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    "aria-label"?: string;
    className?: string;
}

// Accessible on/off toggle (role="switch"). Controlled — drives state in the
// parent. Use instead of a bare checkbox when a clear two-state control reads
// more naturally (e.g. Open/Closed, On/Off).
export function Switch({
    checked,
    onCheckedChange,
    disabled,
    id,
    className,
    ...rest
}: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
                "transition-colors motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-brand" : "bg-border",
                className,
            )}
            {...rest}
        >
            <span
                className={cn(
                    "inline-block size-5 transform rounded-full bg-white shadow-sm",
                    "transition-transform motion-reduce:transition-none",
                    checked ? "translate-x-5" : "translate-x-0.5",
                )}
            />
        </button>
    );
}
