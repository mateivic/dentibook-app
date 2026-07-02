import { CancelShell } from '@/features/booking/components/cancel-shell';
import { CancelContent } from '@/features/booking/components/cancel-content';

interface PageProps {
    params: Promise<{ subdomain: string; token: string }>;
}

export default async function CancelDone({ params }: PageProps) {
    const { subdomain } = await params;
    return (
        <CancelShell subdomain={subdomain}>
            <CancelContent variant="done" />
        </CancelShell>
    );
}
