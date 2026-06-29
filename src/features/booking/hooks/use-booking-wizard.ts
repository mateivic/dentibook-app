"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useTenant } from "@/features/tenant-theme/theme-provider";
import {
    canProceed,
    initialState,
    reconcileWithBundle,
    reducer,
    type BookingAction,
    type BookingState,
} from "../lib/booking-state";
import { clearState, loadState, saveState } from "../lib/booking-storage";
import { submitBookingAction } from "../actions/submit-booking";
import { useSlotsQuery, type SlotsQueryState } from "./use-slots-query";

const STORAGE_DEBOUNCE_MS = 200;

export interface UseBookingWizardReturn {
    state: BookingState;
    dispatch: React.Dispatch<BookingAction>;
    slotsQuery: SlotsQueryState;
    canProceed: boolean;
    submit: () => Promise<void>;
    reset: () => void;
}

export function useBookingWizard(): UseBookingWizardReturn {
    const { tenant, locations, services } = useTenant();

    const [state, dispatch] = useReducer(
        reducer,
        undefined,
        () => initialState(locations),
    );

    // Hydrate from localStorage once on mount. Until this fires, state matches
    // the server-rendered initial state so React hydration doesn't complain.
    const hydrated = useRef(false);
    useEffect(() => {
        if (hydrated.current) return;
        hydrated.current = true;
        const stored = loadState(tenant.id, locations, services);
        dispatch({ type: "HYDRATE", state: stored });
    }, [tenant.id, locations, services]);

    // Reconcile when the tenant bundle changes (e.g. admin edits services mid-flow).
    useEffect(() => {
        if (!hydrated.current) return;
        const reconciled = reconcileWithBundle(state, locations, services);
        if (reconciled !== state) {
            dispatch({ type: "HYDRATE", state: reconciled });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locations, services]);

    // Auto-advance from the location step when only one location exists.
    useEffect(() => {
        if (
            state.step === "location" &&
            locations.length === 1 &&
            state.locationId === locations[0].id
        ) {
            dispatch({ type: "NEXT" });
        }
    }, [state.step, state.locationId, locations]);

    // Persist to localStorage (debounced) on every state change after hydration.
    useEffect(() => {
        if (!hydrated.current) return;
        const handle = window.setTimeout(() => {
            if (state.step === "success") {
                clearState(tenant.id);
            } else {
                saveState(tenant.id, state);
            }
        }, STORAGE_DEBOUNCE_MS);
        return () => window.clearTimeout(handle);
    }, [state, tenant.id]);

    const slotsQuery = useSlotsQuery({
        enabled: state.step === "datetime",
        locationId: state.locationId,
        date: state.date,
        serviceIds: state.serviceIds,
    });

    const submit = useCallback(async () => {
        if (!state.locationId || !state.startIso || state.serviceIds.length === 0) return;

        dispatch({ type: "SUBMIT_START" });
        const result = await submitBookingAction({
            locationId: state.locationId,
            serviceIds: state.serviceIds,
            startIso: state.startIso,
            client: state.client,
        });

        if (result.ok) {
            dispatch({ type: "SUBMIT_SUCCESS", result: result.result });
        } else {
            dispatch({ type: "SUBMIT_ERROR", error: result.error });
        }
    }, [state.locationId, state.startIso, state.serviceIds, state.client, tenant.id]);

    const reset = useCallback(() => {
        clearState(tenant.id);
        dispatch({ type: "RESET" });
    }, [tenant.id]);

    return {
        state,
        dispatch,
        slotsQuery,
        canProceed: canProceed(state),
        submit,
        reset,
    };
}
