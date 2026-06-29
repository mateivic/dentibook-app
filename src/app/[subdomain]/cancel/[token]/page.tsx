import { notFound } from 'next/navigation';
import {
    confirmCancellation,
    getReservationByToken,
} from '@/features/booking/actions/cancel';
import { formatLocalDateTime } from '@/features/booking/lib/duration';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PageProps {
    params: Promise<{ subdomain: string; token: string }>;
}

export default async function CancelPage({ params }: PageProps) {
    const { subdomain, token } = await params;
    const reservation = await getReservationByToken(token);
    if (!reservation) notFound();

    if (reservation.status === 'CANCELLED') {
        return (
            <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12 text-center">
                <h1 className="text-2xl font-semibold">Already cancelled</h1>
                <p className="mt-3 text-ink-muted">
                    This reservation was already cancelled.
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
            <h1 className="text-2xl font-semibold">Cancel your reservation?</h1>
            <p className="mt-2 text-ink-muted">
                Please confirm that you want to cancel the reservation below.
            </p>

            <Card className="my-6 bg-surface-muted">
                <div className="space-y-1 text-sm">
                    <p>
                        <span className="text-ink-muted">Location: </span>
                        {reservation.locationName}
                    </p>
                    <p>
                        <span className="text-ink-muted">When: </span>
                        {formatLocalDateTime(reservation.startTime, reservation.timezone)}
                    </p>
                    <p>
                        <span className="text-ink-muted">Services: </span>
                        {reservation.serviceNames.join(', ')}
                    </p>
                </div>
            </Card>

            <form action={confirmCancellation} className="flex gap-3">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="subdomain" value={subdomain} />
                <Button type="submit" variant="destructive">
                    Cancel reservation
                </Button>
                <a
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-ink hover:bg-surface-muted"
                >
                    Keep reservation
                </a>
            </form>
        </main>
    );
}
