"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    applyToAllCommit,
    applyToAllPreview,
    type ApplyToAllPreviewResult,
} from "../actions/apply-to-all";

interface ApplyToAllModalProps {
    sourceLocationId: string;
    onClose: () => void;
}

export function ApplyToAllModal({ sourceLocationId, onClose }: ApplyToAllModalProps) {
    const [preview, setPreview] = useState<ApplyToAllPreviewResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let cancelled = false;
        applyToAllPreview({ sourceLocationId })
            .then((result) => {
                if (cancelled) return;
                if (result.ok) {
                    setPreview(result);
                } else {
                    setError(result.error ?? "Failed to load preview");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [sourceLocationId]);

    function handleConfirm() {
        startTransition(async () => {
            const result = await applyToAllCommit({ sourceLocationId });
            if (result.ok) {
                onClose();
            } else {
                setError(result.error ?? "Failed to apply");
            }
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-lg border border-border bg-white p-4 shadow-xl animate-in zoom-in-95 duration-200 sm:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold">Apply to all locations</h2>
                <p className="mt-1 text-sm text-ink-muted">
                    This will replace all categories and services at the other locations with
                    those from{" "}
                    <span className="font-medium text-ink">
                        {preview?.sourceLocationName ?? "this location"}
                    </span>
                    .
                </p>

                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {loading && <p className="text-sm text-ink-muted">Loading preview…</p>}
                    {error && (
                        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {preview?.ok && preview.targets && (
                        <div className="space-y-3">
                            <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
                                Source: {preview.sourceCategoriesCount} categories,{" "}
                                {preview.sourceServicesCount} services will be copied to each
                                target location.
                            </div>

                            {preview.targets.length === 0 ? (
                                <p className="text-sm text-ink-muted">No other locations.</p>
                            ) : (
                                <ul className="divide-y divide-border rounded-md border border-border">
                                    {preview.targets.map((t) => (
                                        <li key={t.locationId} className="p-3">
                                            <p className="font-medium">{t.locationName}</p>
                                            <p className="text-xs text-ink-muted">
                                                Will delete {t.categoriesToDelete} categor
                                                {t.categoriesToDelete === 1 ? "y" : "ies"} and{" "}
                                                {t.servicesToDelete} service
                                                {t.servicesToDelete === 1 ? "" : "s"}.
                                            </p>
                                            {t.servicesWithFutureBookings.length > 0 && (
                                                <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                                    <p className="font-medium">
                                                        ⚠ The following services have future
                                                        bookings whose service link will be
                                                        removed:
                                                    </p>
                                                    <ul className="mt-1 list-inside list-disc">
                                                        {t.servicesWithFutureBookings.map(
                                                            (s) => (
                                                                <li key={s.id}>
                                                                    {s.name} ({s.bookingCount}{" "}
                                                                    booking
                                                                    {s.bookingCount === 1
                                                                        ? ""
                                                                        : "s"}
                                                                    )
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={
                            isPending || loading || !preview?.ok || preview.targets?.length === 0
                        }
                    >
                        {isPending ? "Applying…" : "Yes, apply to all"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
