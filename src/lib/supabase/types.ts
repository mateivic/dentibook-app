// Hand-written for v1. Regenerate later via:
//   supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts

export interface TenantConfig {
  primary?: string;
  /** @deprecated kept for backwards-compat; prefer `secondary`. */
  accent?: string;
  secondary?: string;
  /** CSS length applied to button corners, e.g. "9999px" (pill) or "0.5rem". */
  radius?: string;
  /** Google Font family for headings/hero, e.g. "Playfair Display". Defaults to Cormorant Garamond. */
  fontDisplay?: string;
  /** Google Font family for body text, e.g. "Inter". Defaults to Geist. */
  fontBody?: string;
  /** Short tagline shown on the intro/hero screen. */
  tagline?: string;
  /** Enabled UI languages, e.g. ["hr", "en"]. */
  languages?: string[];
  /** Initial language; must be one of `languages`. Defaults to "hr". */
  defaultLanguage?: string;
  /** Show service prices on the public booking site. Missing = true (visible). */
  showPrices?: boolean;
}

export type WorkingHoursValue = { open: string; close: string } | null;
export type WorkingHours = Record<string, WorkingHoursValue>;

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo_path: string | null;
  hero_path: string | null;
  config: TenantConfig;
  created_at: string;
}

export interface TenantPublic {
  id: string;
  name: string;
  subdomain: string;
  logo_path: string | null;
  hero_path: string | null;
  config: TenantConfig;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  contact_email: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  /** Free-form social links, e.g. { instagram: "https://…", facebook: "https://…" }. */
  socials: Record<string, string>;
  timezone: string;
  working_hours: WorkingHours;
  image_path: string | null;
  created_at: string;
}

export interface CalendarIntegration {
  id: string;
  tenant_id: string;
  location_id: string;
  google_email: string | null;
  google_calendar_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  tenant_id: string;
  location_id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  location_id: string;
  category_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  display_order: number;
  created_at: string;
}

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
export type GoogleSyncStatus = "PENDING" | "SYNCED" | "FAILED";

export interface Reservation {
  id: string;
  tenant_id: string;
  location_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: ReservationStatus;
  google_event_id: string | null;
  google_sync_status: GoogleSyncStatus;
  cancellation_token: string;
  sms_reminder_sent: boolean;
  cancelled_at: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  role: string;
  created_at: string;
}
