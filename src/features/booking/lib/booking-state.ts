import type { Location, Service } from "@/lib/supabase/types";
import { DEFAULT_PHONE_COUNTRY } from "./countries";

export type WizardStep =
    | "intro"
    | "location"
    | "services"
    | "datetime"
    | "contact"
    | "submitting"
    | "success";

export const ORDERED_STEPS: WizardStep[] = ["location", "services", "datetime", "contact"];

export interface ClientInput {
    firstName: string;
    lastName: string;
    email: string;
    phoneCountry: string; // ISO2 country code for the phone dial code
    phone: string; // national number, digits and spaces only
    notes: string;
}

export interface BookingResult {
    reservationId: string;
    cancellationToken: string;
}

export interface BookingState {
    step: WizardStep;
    locationId: string | null;
    serviceIds: string[];
    date: string | null;        // YYYY-MM-DD in location's timezone
    startIso: string | null;    // full UTC ISO once a slot is picked
    client: ClientInput;
    result: BookingResult | null;
    error: string | null;
}

export type BookingAction =
    | { type: "HYDRATE"; state: BookingState }
    | { type: "SET_LOCATION"; locationId: string }
    | { type: "SET_SERVICES"; serviceIds: string[] }
    | { type: "SET_DATE"; date: string }
    | { type: "SET_SLOT"; startIso: string }
    | { type: "PATCH_CLIENT"; patch: Partial<ClientInput> }
    | { type: "GOTO_STEP"; step: WizardStep }
    | { type: "START" }
    | { type: "NEXT" }
    | { type: "BACK" }
    | { type: "SUBMIT_START" }
    | { type: "SUBMIT_SUCCESS"; result: BookingResult }
    | { type: "SUBMIT_ERROR"; error: string }
    | { type: "RESET" };

export function emptyClient(): ClientInput {
    return {
        firstName: "",
        lastName: "",
        email: "",
        phoneCountry: DEFAULT_PHONE_COUNTRY,
        phone: "",
        notes: "",
    };
}

export function initialState(locations: Location[]): BookingState {
    return {
        step: "intro",
        locationId: locations.length === 1 ? locations[0].id : null,
        serviceIds: [],
        date: null,
        startIso: null,
        client: emptyClient(),
        result: null,
        error: null,
    };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactField = "firstName" | "lastName" | "email" | "phone";

// Field-level validation for the Details step. Returns a map of field ->
// translation code (see Dictionary["validation"]) for invalid fields only;
// the UI resolves the code to a localized message. Reused by `canProceed`.
export function validateContact(
    client: ClientInput,
): Partial<Record<ContactField, string>> {
    const errors: Partial<Record<ContactField, string>> = {};
    if (!client.firstName.trim()) errors.firstName = "firstName";
    if (!client.lastName.trim()) errors.lastName = "lastName";
    if (!EMAIL_RE.test(client.email.trim())) {
        errors.email = "email";
    }
    const phone = client.phone.trim();
    if (!phone) {
        errors.phone = "phoneRequired";
    } else if (!/^[\d ]+$/.test(phone) || phone.replace(/\D/g, "").length < 6) {
        errors.phone = "phoneInvalid";
    }
    return errors;
}

export function canProceed(state: BookingState): boolean {
    switch (state.step) {
        case "location":
            return Boolean(state.locationId);
        case "services":
            return state.serviceIds.length > 0;
        case "datetime":
            return Boolean(state.startIso);
        case "contact":
            return Object.keys(validateContact(state.client)).length === 0;
        default:
            return false;
    }
}

function nextStep(step: WizardStep): WizardStep {
    const idx = ORDERED_STEPS.indexOf(step);
    if (idx === -1 || idx === ORDERED_STEPS.length - 1) return step;
    return ORDERED_STEPS[idx + 1];
}

function prevStep(step: WizardStep): WizardStep {
    const idx = ORDERED_STEPS.indexOf(step);
    if (idx <= 0) return step;
    return ORDERED_STEPS[idx - 1];
}

export function reducer(state: BookingState, action: BookingAction): BookingState {
    switch (action.type) {
        case "HYDRATE":
            return action.state;

        case "SET_LOCATION":
            if (state.locationId === action.locationId) return state;
            return {
                ...state,
                locationId: action.locationId,
                serviceIds: [],
                date: null,
                startIso: null,
            };

        case "SET_SERVICES":
            return {
                ...state,
                serviceIds: action.serviceIds,
                startIso: null,
            };

        case "SET_DATE":
            return { ...state, date: action.date, startIso: null };

        case "SET_SLOT":
            return { ...state, startIso: action.startIso };

        case "PATCH_CLIENT":
            return { ...state, client: { ...state.client, ...action.patch } };

        case "GOTO_STEP":
            return { ...state, step: action.step, error: null };

        case "START":
            return { ...state, step: ORDERED_STEPS[0], error: null };

        case "NEXT":
            if (!canProceed(state)) return state;
            return { ...state, step: nextStep(state.step), error: null };

        case "BACK":
            return { ...state, step: prevStep(state.step), error: null };

        case "SUBMIT_START":
            return { ...state, step: "submitting", error: null };

        case "SUBMIT_SUCCESS":
            return { ...state, step: "success", result: action.result, error: null };

        case "SUBMIT_ERROR":
            return { ...state, step: "contact", error: action.error };

        case "RESET":
            return initialState([]);

        default:
            return state;
    }
}

export function reconcileWithBundle(
    state: BookingState,
    locations: Location[],
    services: Service[],
): BookingState {
    const validLocationIds = new Set(locations.map((l) => l.id));
    const validServiceIds = new Set(services.map((s) => s.id));

    const locationId =
        state.locationId && validLocationIds.has(state.locationId) ? state.locationId : null;
    const serviceIds = state.serviceIds.filter((id) => validServiceIds.has(id));

    let { step, date, startIso } = state;

    // The intro/hero screen is a pre-step with no selections to reconcile —
    // never bump the user off it just because nothing is chosen yet.
    if (step !== "intro") {
        if (!locationId) {
            step = "location";
            date = null;
            startIso = null;
        } else if (serviceIds.length === 0 && (step === "datetime" || step === "contact")) {
            step = "services";
            date = null;
            startIso = null;
        } else if (!startIso && step === "contact") {
            step = "datetime";
        }

        if (step === "success" || step === "submitting") step = "location";
    }

    const unchanged =
        step === state.step &&
        locationId === state.locationId &&
        serviceIds.length === state.serviceIds.length &&
        serviceIds.every((id, i) => id === state.serviceIds[i]) &&
        date === state.date &&
        startIso === state.startIso;

    if (unchanged) return state;
    return { ...state, step, locationId, serviceIds, date, startIso };
}
