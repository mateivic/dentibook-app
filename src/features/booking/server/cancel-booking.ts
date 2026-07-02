import "server-only";
import { after } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getAvailabilityConnector } from "@/features/availability/connectors/factory";
import { sendBookingCancellationEmail } from "@/features/booking/server/booking-emails";

export type CancelBookingResult =
  | { ok: true; alreadyCancelled: boolean }
  | { ok: false; status: number; error: string };

export async function cancelBookingByToken(
  subdomain: string,
  token: string,
): Promise<CancelBookingResult> {
  if (!token) return { ok: false, status: 400, error: "token required" };

  const supabase = getSupabaseServiceRoleClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, logo_path, hero_path, config")
    .eq("subdomain", subdomain)
    .maybeSingle();
  if (!tenant) return { ok: false, status: 404, error: "Tenant not found" };

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select(
      "id, tenant_id, location_id, status, google_event_id, start_time, clients!inner(first_name, last_name, email), locations!inner(name, timezone, address, phone, website, socials), reservation_services(services(name))",
    )
    .eq("cancellation_token", token)
    .maybeSingle();

  if (error || !reservation || reservation.tenant_id !== tenant.id) {
    return { ok: false, status: 404, error: "Reservation not found" };
  }

  if (reservation.status === "CANCELLED") {
    return { ok: true, alreadyCancelled: true };
  }

  const { error: updateErr } = await supabase
    .from("reservations")
    .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() })
    .eq("id", reservation.id);

  if (updateErr) {
    console.error("[cancelBooking] update failed", updateErr);
    return { ok: false, status: 500, error: "Failed to cancel reservation" };
  }

  if (reservation.google_event_id) {
    try {
      const connector = await getAvailabilityConnector(
        supabase,
        reservation.location_id,
      );
      await connector.deleteEvent(reservation.google_event_id);
    } catch (err) {
      console.error("[cancelBooking] calendar delete failed (non-fatal)", err);
    }
  }

  // Best-effort cancellation notice to the client, after the response.
  const client = reservation.clients as unknown as {
    first_name: string;
    last_name: string;
    email: string | null;
  } | null;
  const location = reservation.locations as unknown as {
    name: string;
    timezone: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    socials: Record<string, string> | null;
  } | null;
  const serviceNames = (
    (reservation.reservation_services as unknown as
      | { services: { name: string } | null }[]
      | null) ?? []
  )
    .map((rs) => rs.services?.name)
    .filter((n): n is string => Boolean(n));
  if (client?.email && location) {
    after(() =>
      sendBookingCancellationEmail({
        subdomain,
        tenantName: tenant.name,
        tenantLogoPath: tenant.logo_path,
        tenantHeroPath: tenant.hero_path,
        primaryColor: tenant.config?.styles?.primary ?? null,
        clientName: `${client.first_name} ${client.last_name}`,
        clientEmail: client.email as string,
        locationName: location.name,
        locationAddress: location.address,
        locationPhone: location.phone,
        website: location.website,
        socials: location.socials ?? {},
        serviceNames,
        startIso: reservation.start_time as string,
        timezone: location.timezone,
      }),
    );
  }

  return { ok: true, alreadyCancelled: false };
}
