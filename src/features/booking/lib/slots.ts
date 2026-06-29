import { formatHHMM } from "./timezone";
import type { DayWindow } from "./working-hours";

// Default spacing between bookable start times, in minutes.
export const DEFAULT_SLOT_INTERVAL_MINUTES = 30;

// Single source of truth for a location's slot interval. Today every location
// uses the default; this is the one place to read a per-location override once
// the admin portal can set one (e.g. a `slot_interval_minutes` column or a
// `config` jsonb on the location). Reading through a permissive cast keeps this
// the integration point without a schema/type change yet — when the column
// lands, add it to the `Location` type and drop the cast.
export function resolveSlotIntervalMinutes(location: { id: string }): number {
  const override = (location as { slot_interval_minutes?: number | null })
    .slot_interval_minutes;
  return override ?? DEFAULT_SLOT_INTERVAL_MINUTES;
}

export interface GenerateSlotsArgs {
  dayWindow: DayWindow;
  durationMin: number;
  intervalMin: number;
  busy: Array<{ start: number; end: number }>;
  nowMs: number;
  timezone: string;
}

// Bookable start times (HH:MM in `timezone`) that fit `durationMin` inside the
// working-hours window, stepping by `intervalMin`, excluding past times and any
// slot overlapping a busy window.
export function generateSlots({
  dayWindow,
  durationMin,
  intervalMin,
  busy,
  nowMs,
  timezone,
}: GenerateSlotsArgs): string[] {
  const slots: string[] = [];
  const stepMs = intervalMin * 60_000;
  const durationMs = durationMin * 60_000;
  const endMs = dayWindow.endUtc.getTime();

  for (let t = dayWindow.startUtc.getTime(); t + durationMs <= endMs; t += stepMs) {
    if (t < nowMs) continue;
    const slotEnd = t + durationMs;
    const overlaps = busy.some((b) => t < b.end && slotEnd > b.start);
    if (!overlaps) slots.push(formatHHMM(new Date(t), timezone));
  }
  return slots;
}
