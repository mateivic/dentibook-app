import { notFound } from 'next/navigation';
import { getReservationByToken } from '@/features/booking/actions/cancel';
import { CancelShell } from '@/features/booking/components/cancel-shell';
import { CancelContent } from '@/features/booking/components/cancel-content';

interface PageProps {
    params: Promise<{ subdomain: string; token: string }>;
}

export default async function CancelPage({ params }: PageProps) {
    const { subdomain, token } = await params;
    const reservation = await getReservationByToken(token);
    if (!reservation) notFound();

    return (
        <CancelShell subdomain={subdomain}>
            {reservation.status === 'CANCELLED' ? (
                <CancelContent variant="already" />
            ) : (
                <CancelContent
                    variant="confirm"
                    token={token}
                    subdomain={subdomain}
                    reservation={reservation}
                />
            )}
        </CancelShell>
    );
}
