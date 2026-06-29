"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { Location } from "@/lib/supabase/types";

interface LocationFilterProps {
    locations: Location[];
    includeAll?: boolean;
    className?: string;
    label?: string;
}

export const LOCATION_ALL_VALUE = "all";

export function LocationFilter({
    locations,
    includeAll = false,
    className,
    label = "Location",
}: LocationFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();

    const current = searchParams.get("location") ?? "";

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const next = event.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (includeAll && next === LOCATION_ALL_VALUE) {
            params.delete("location");
        } else if (next) {
            params.set("location", next);
        } else {
            params.delete("location");
        }

        const qs = params.toString();
        startTransition(() => {
            router.push(qs ? `?${qs}` : "?");
        });
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <label htmlFor="location-filter" className="text-sm text-ink-muted">
                {label}
            </label>
            <select
                id="location-filter"
                value={includeAll && !current ? LOCATION_ALL_VALUE : current}
                onChange={handleChange}
                disabled={pending}
                className={cn(
                    "h-9 rounded-md border border-border bg-white px-3 text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                    "disabled:opacity-50",
                )}
            >
                {includeAll && (
                    <option value={LOCATION_ALL_VALUE}>All locations</option>
                )}
                {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                        {loc.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
