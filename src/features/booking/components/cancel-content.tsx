"use client";

import { Card } from "@/components/ui/card";
import { useT } from "@/features/i18n/language-provider";
import { formatLocalDateTime } from "../lib/duration";
import { CancelForm } from "./cancel-form";
import type { ReservationPreview } from "../actions/cancel";

// All localized, client-rendered text for the cancellation flow. Kept in one
// client component so the language switcher actually swaps the copy (the pages
// themselves are server components that only fetch data and pick a variant).
type CancelContentProps =
    | { variant: "confirm"; token: string; subdomain: string; reservation: ReservationPreview }
    | { variant: "already" }
    | { variant: "done" };

export function CancelContent(props: CancelContentProps) {
    const t = useT();

    if (props.variant === "already") {
        return (
            <>
                <h1 className="font-display text-3xl font-medium tracking-tight">
                    {t.cancel.alreadyHeading}
                </h1>
                <p className="mt-3 text-ink-muted">{t.cancel.alreadyText}</p>
            </>
        );
    }

    if (props.variant === "done") {
        return (
            <>
                <h1 className="font-display text-3xl font-medium tracking-tight">
                    {t.cancel.doneHeading}
                </h1>
                <p className="mt-3 max-w-sm text-ink-muted">{t.cancel.doneText}</p>
            </>
        );
    }

    const { reservation, token, subdomain } = props;
    return (
        <>
            <h1 className="font-display text-3xl font-medium tracking-tight">
                {t.cancel.heading}
            </h1>
            <p className="mt-2 text-ink-muted">{t.cancel.subtext}</p>

            <Card className="my-6 w-full bg-surface-muted text-left">
                <div className="space-y-1 text-sm">
                    <p>
                        <span className="text-ink-muted">{t.contact.locationLabel}</span>
                        {reservation.locationName}
                    </p>
                    <p>
                        <span className="text-ink-muted">{t.contact.whenLabel}</span>
                        {formatLocalDateTime(reservation.startTime, reservation.timezone)}
                    </p>
                    <p>
                        <span className="text-ink-muted">{t.contact.servicesLabel}</span>
                        {reservation.serviceNames.join(", ")}
                    </p>
                </div>
            </Card>

            <CancelForm token={token} subdomain={subdomain} />
        </>
    );
}
