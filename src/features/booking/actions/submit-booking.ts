"use server";

import { headers } from "next/headers";
import {
  processBooking,
  type ProcessBookingInput,
} from "../server/process-booking";
import type { BookingResult, ClientInput } from "../lib/booking-state";
import { dialCodeFor } from "../lib/countries";

export interface SubmitBookingInput {
  locationId: string;
  serviceIds: string[];
  startIso: string;
  client: ClientInput;
}

export type SubmitBookingResult =
  | { ok: true; result: BookingResult }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitBookingAction(
  input: SubmitBookingInput,
): Promise<SubmitBookingResult> {
  const validationError = validate(input);
  if (validationError) return { ok: false, error: validationError };

  const subdomain = await resolveSubdomain();
  if (!subdomain)
    return { ok: false, error: "Could not resolve clinic from URL" };

  const dial = dialCodeFor(input.client.phoneCountry);
  const national = toNationalNumber(input.client.phone, dial);
  const fullPhone = national ? `${dial} ${national}` : "";

  const payload: ProcessBookingInput = {
    locationId: input.locationId,
    serviceIds: input.serviceIds,
    startTime: input.startIso,
    client: {
      firstName: input.client.firstName.trim(),
      lastName: input.client.lastName.trim(),
      email: input.client.email.trim(),
      phone: fullPhone,
      notes: input.client.notes.trim() || undefined,
    },
  };

  const result = await processBooking(subdomain, payload);
  if (!result.ok) return { ok: false, error: result.error };

  return {
    ok: true,
    result: {
      reservationId: result.reservationId,
      cancellationToken: result.cancellationToken,
    },
  };
}

// The phone field is national-only, but users sometimes type the country code
// too (e.g. "+385 91…" or "385 91…"). Strip a leading dial code so combining it
// with the selected country's code doesn't duplicate it.
function toNationalNumber(raw: string, dialCode: string): string {
  let n = raw.trim();
  if (n.startsWith("+")) n = n.slice(1).trimStart();
  const dialDigits = dialCode.replace(/\D/g, "");
  if (n.startsWith(dialDigits)) n = n.slice(dialDigits.length).trimStart();
  return n.trim();
}

function validate(input: SubmitBookingInput): string | null {
  if (!input.locationId) return "Choose a location.";
  if (!input.serviceIds.length) return "Choose at least one service.";
  if (!input.startIso) return "Choose a time slot.";
  if (!input.client.firstName.trim() || !input.client.lastName.trim()) {
    return "Please enter your full name.";
  }
  if (!EMAIL_RE.test(input.client.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!input.client.phone.trim()) return "Please enter a phone number.";
  return null;
}

// Pull the tenant subdomain off the incoming request's host header. The proxy
// already validated it matches a real tenant before this server action runs.
async function resolveSubdomain(): Promise<string | null> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "lvh.me";
  const hostWithoutPort = host.split(":")[0];
  if (!hostWithoutPort.endsWith(baseDomain) || hostWithoutPort === baseDomain) {
    return null;
  }
  const sub = hostWithoutPort.slice(0, -baseDomain.length - 1);
  return sub && sub !== "www" ? sub : null;
}
