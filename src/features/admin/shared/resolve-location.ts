import type { Location } from "@/lib/supabase/types";

export const LOCATION_ALL_VALUE = "all";

export type ResolvedLocation =
    | { kind: "all" }
    | { kind: "one"; location: Location }
    | { kind: "empty" };

interface ResolveOptions {
    /** When true, returns kind "all" if no valid location query param is present. */
    allowAll?: boolean;
}

/**
 * Pick a location based on the ?location= search param.
 * - If `allowAll` and param is missing or "all" -> { kind: "all" }
 * - If a valid location id is provided -> { kind: "one", location }
 * - Otherwise falls back to the first location ordered by name (default for
 *   services and working-hours pages)
 * - If the tenant has no locations -> { kind: "empty" }
 */
export function resolveLocation(
    locations: Location[],
    param: string | undefined,
    { allowAll = false }: ResolveOptions = {},
): ResolvedLocation {
    if (locations.length === 0) return { kind: "empty" };

    if (allowAll && (!param || param === LOCATION_ALL_VALUE)) {
        return { kind: "all" };
    }

    const matched = param ? locations.find((l) => l.id === param) : undefined;
    if (matched) return { kind: "one", location: matched };

    // Sorted by name in the bundle query, so [0] is the first alphabetically.
    return { kind: "one", location: locations[0] };
}
