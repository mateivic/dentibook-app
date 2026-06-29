"use client";

import { PHONE_COUNTRIES } from "../lib/countries";
import { cn } from "@/lib/utils";

interface PhoneFieldProps {
    id?: string;
    country: string;
    number: string;
    onCountryChange: (iso: string) => void;
    onNumberChange: (value: string) => void;
    onBlur?: () => void;
    invalid?: boolean;
}

// Country dial-code selector + national-number input, grouped in one bordered
// pill. The number input only accepts digits and spaces.
export function PhoneField({
    id,
    country,
    number,
    onCountryChange,
    onNumberChange,
    onBlur,
    invalid,
}: PhoneFieldProps) {
    return (
        <div
            className={cn(
                "flex h-10 w-full items-stretch overflow-hidden rounded-md border bg-surface",
                "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-1",
                invalid ? "border-red-400" : "border-border",
            )}
        >
            <select
                aria-label="Country code"
                value={country}
                onChange={(e) => onCountryChange(e.target.value)}
                onBlur={onBlur}
                className="h-full shrink-0 border-r border-border bg-surface-muted pl-3 pr-2 text-sm focus:outline-none"
            >
                {PHONE_COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.iso}>
                        {c.flag} {c.dial}
                    </option>
                ))}
            </select>
            <input
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={number}
                onChange={(e) => onNumberChange(e.target.value.replace(/[^\d ]/g, ""))}
                onBlur={onBlur}
                className="h-full w-full bg-surface px-3 text-sm placeholder:text-ink-muted focus:outline-none"
            />
        </div>
    );
}
