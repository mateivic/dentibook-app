"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    updateWorkingHours,
    type UpdateWorkingHoursState,
} from "../actions/update-working-hours";
import type { WorkingHours } from "@/lib/supabase/types";

interface WorkingHoursFormProps {
    locationId: string;
    locationName: string;
    workingHours: WorkingHours;
}

interface DayState {
    closed: boolean;
    open: string;
    close: string;
}

const WEEKDAYS: Array<{ key: string; short: string; label: string }> = [
    { key: "mon", short: "Mon", label: "Monday" },
    { key: "tue", short: "Tue", label: "Tuesday" },
    { key: "wed", short: "Wed", label: "Wednesday" },
    { key: "thu", short: "Thu", label: "Thursday" },
    { key: "fri", short: "Fri", label: "Friday" },
    { key: "sat", short: "Sat", label: "Saturday" },
    { key: "sun", short: "Sun", label: "Sunday" },
];

const initialActionState: UpdateWorkingHoursState = { ok: null };

function buildInitialDays(workingHours: WorkingHours): Record<string, DayState> {
    return WEEKDAYS.reduce<Record<string, DayState>>((acc, { key }) => {
        const cfg = workingHours[key];
        acc[key] = cfg
            ? { closed: false, open: cfg.open, close: cfg.close }
            : { closed: true, open: "09:00", close: "17:00" };
        return acc;
    }, {});
}

export function WorkingHoursForm({
    locationId,
    locationName,
    workingHours,
}: WorkingHoursFormProps) {
    const [state, action, pending] = useActionState(updateWorkingHours, initialActionState);
    const [days, setDays] = useState(() => buildInitialDays(workingHours));

    function setDay(key: string, patch: Partial<DayState>) {
        setDays((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    }

    function applyToWeekdays() {
        const mon = days.mon;
        setDays((prev) => ({
            ...prev,
            tue: { ...mon },
            wed: { ...mon },
            thu: { ...mon },
            fri: { ...mon },
        }));
    }

    function applyToAll() {
        const mon = days.mon;
        setDays((prev) => {
            const next = { ...prev };
            for (const { key } of WEEKDAYS) {
                next[key] = { ...mon };
            }
            return next;
        });
    }

    function closeWeekends() {
        setDays((prev) => ({
            ...prev,
            sat: { ...prev.sat, closed: true },
            sun: { ...prev.sun, closed: true },
        }));
    }

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="locationId" value={locationId} />

            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-lg font-medium">{locationName}</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={applyToWeekdays}
                        className="text-ink-muted"
                    >
                        Mon→Fri same as Monday
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={applyToAll}
                        className="text-ink-muted"
                    >
                        All week same as Monday
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={closeWeekends}
                        className="text-ink-muted"
                    >
                        Close weekends
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {WEEKDAYS.map(({ key, short, label }) => {
                    const day = days[key];
                    return (
                        <div
                            key={key}
                            className={cn(
                                "rounded-lg border p-4 transition-colors",
                                day.closed
                                    ? "border-border bg-surface-muted"
                                    : "border-brand/30 bg-white",
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">{label}</p>
                                    <p className="text-xs uppercase tracking-wider text-ink-muted">
                                        {short}
                                    </p>
                                </div>
                                <label className="inline-flex items-center gap-2 text-xs">
                                    <span
                                        className={cn(
                                            "font-medium",
                                            day.closed ? "text-ink-muted" : "text-brand",
                                        )}
                                    >
                                        {day.closed ? "Closed" : "Open"}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={!day.closed}
                                        onChange={(e) =>
                                            setDay(key, { closed: !e.target.checked })
                                        }
                                        className="h-4 w-4 accent-brand"
                                    />
                                </label>
                            </div>

                            <input
                                type="hidden"
                                name={`${key}_closed`}
                                value={day.closed ? "on" : ""}
                            />

                            <div
                                className={cn(
                                    "mt-3 grid grid-cols-2 gap-2 transition-opacity",
                                    day.closed ? "pointer-events-none opacity-50" : "opacity-100",
                                )}
                            >
                                <div>
                                    <label className="text-xs text-ink-muted">Open</label>
                                    <Input
                                        type="time"
                                        name={`${key}_open`}
                                        value={day.open}
                                        onChange={(e) =>
                                            setDay(key, { open: e.target.value })
                                        }
                                        disabled={day.closed}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-ink-muted">Close</label>
                                    <Input
                                        type="time"
                                        name={`${key}_close`}
                                        value={day.close}
                                        onChange={(e) =>
                                            setDay(key, { close: e.target.value })
                                        }
                                        disabled={day.closed}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {state.ok === false && state.error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {state.error}
                </p>
            )}
            {state.ok === true && (
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Saved.
                </p>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}
