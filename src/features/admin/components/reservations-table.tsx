import { formatLocalDateTime } from '@/features/booking/lib/duration';

export interface ReservationRow {
    id: string;
    startTime: string;
    locationName: string;
    locationTimezone: string;
    clientName: string;
    serviceNames: string[];
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

interface ReservationsTableProps {
    rows: ReservationRow[];
}

const statusStyles: Record<ReservationRow['status'], string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    CONFIRMED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-zinc-100 text-zinc-600',
    COMPLETED: 'bg-blue-50 text-blue-700',
};

export function ReservationsTable({ rows }: ReservationsTableProps) {
    if (rows.length === 0) {
        return <p className="text-ink-muted">No upcoming reservations.</p>;
    }
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-ink-muted">
                    <tr>
                        <th className="px-4 py-3 font-medium">When</th>
                        <th className="px-4 py-3 font-medium">Klijent</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Services</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <td className="px-4 py-3">{formatLocalDateTime(r.startTime, r.locationTimezone)}</td>
                            <td className="px-4 py-3">{r.clientName}</td>
                            <td className="px-4 py-3">{r.locationName}</td>
                            <td className="px-4 py-3 text-ink-muted">{r.serviceNames.join(', ')}</td>
                            <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[r.status]}`}>
                                    {r.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
