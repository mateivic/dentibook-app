import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCalendarClientForLocation } from "@/features/calendar/lib/google";
import { createGoogleConnector } from "./google-connector";
import { createDatabaseConnector } from "./database-connector";
import type { AvailabilityConnector } from "./types";

// Resolves the availability connector for a location: Google when a
// calendar_integrations row exists, otherwise the database fallback. Always
// returns a connector — there is no "not configured" state.
export async function getAvailabilityConnector(
  supabase: SupabaseClient,
  locationId: string,
): Promise<AvailabilityConnector> {
  const { client, integration } = await getCalendarClientForLocation(
    supabase,
    locationId,
  );
  if (client && integration) {
    return createGoogleConnector(client, integration.google_calendar_id);
  }
  return createDatabaseConnector(supabase, locationId);
}
