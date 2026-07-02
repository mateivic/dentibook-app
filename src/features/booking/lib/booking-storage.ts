import type { Location, Service } from "@/lib/supabase/types";
import {
  initialState,
  reconcileWithBundle,
  type BookingState,
} from "./booking-state";

const STORAGE_VERSION = 4;

// How long a saved (incomplete) wizard survives. After this, loadState discards
// it and the user starts fresh — a stale half-finished booking is more
// confusing than helpful.
const STORAGE_TTL_MS = 2 * 60 * 1000;

interface StoredShape {
  v: number;
  savedAt: number;
  state: BookingState;
}

export function storageKey(tenantId: string): string {
  return `booking-wizard:${tenantId}`;
}

export function loadState(
  tenantId: string,
  locations: Location[],
  services: Service[],
): BookingState {
  if (typeof window === "undefined") return initialState(locations);

  try {
    const raw = window.localStorage.getItem(storageKey(tenantId));
    if (!raw) return initialState(locations);

    const parsed = JSON.parse(raw) as StoredShape;
    if (parsed.v !== STORAGE_VERSION || !parsed.state) {
      return initialState(locations);
    }
    if (
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > STORAGE_TTL_MS
    ) {
      window.localStorage.removeItem(storageKey(tenantId));
      return initialState(locations);
    }
    return reconcileWithBundle(parsed.state, locations, services);
  } catch {
    return initialState(locations);
  }
}

export function saveState(tenantId: string, state: BookingState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredShape = {
      v: STORAGE_VERSION,
      savedAt: Date.now(),
      state,
    };
    window.localStorage.setItem(storageKey(tenantId), JSON.stringify(payload));
  } catch {
    // Storage may be full or disabled — silently degrade.
  }
}

export function clearState(tenantId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(tenantId));
  } catch {
    // ignore
  }
}
