"use client";

import { useEffect, useState } from "react";

export type SlotsQueryStatus = "idle" | "loading" | "ready" | "error";

export interface SlotsQueryState {
    status: SlotsQueryStatus;
    slots: string[];
    timezone: string | null;
    error: string | null;
}

interface UseSlotsQueryArgs {
    enabled: boolean;
    locationId: string | null;
    date: string | null;
    serviceIds: string[];
}

const idleState: SlotsQueryState = {
    status: "idle",
    slots: [],
    timezone: null,
    error: null,
};

interface SlotApiResponse {
    date: string;
    timezone: string;
    slots: string[];
}

export function useSlotsQuery(args: UseSlotsQueryArgs): SlotsQueryState {
    const [state, setState] = useState<SlotsQueryState>(idleState);
    const serviceKey = args.serviceIds.join(",");

    useEffect(() => {
        if (!args.enabled || !args.locationId || !args.date || !serviceKey) {
            setState(idleState);
            return;
        }

        const ctrl = new AbortController();
        setState({ status: "loading", slots: [], timezone: null, error: null });

        const params = new URLSearchParams({
            locationId: args.locationId,
            date: args.date,
            serviceIds: serviceKey,
        });

        fetch(`/api/slots?${params}`, { signal: ctrl.signal })
            .then(async (resp) => {
                if (!resp.ok) {
                    let message = `Request failed (${resp.status})`;
                    try {
                        const body = await resp.json();
                        if (typeof body.error === "string") message = body.error;
                    } catch {
                        // not JSON
                    }
                    throw new Error(message);
                }
                return (await resp.json()) as SlotApiResponse;
            })
            .then((data) => {
                setState({
                    status: "ready",
                    slots: data.slots,
                    timezone: data.timezone,
                    error: null,
                });
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === "AbortError") return;
                const message = err instanceof Error ? err.message : "Failed to load slots";
                setState({ status: "error", slots: [], timezone: null, error: message });
            });

        return () => ctrl.abort();
    }, [args.enabled, args.locationId, args.date, serviceKey]);

    return state;
}
