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
        <>
            {/* Mobile: each reservation as a stacked card */}
            <ul className="space-y-3 md:hidden">
                {rows.map((r) => (
                    <li key={r.id} className="rounded-lg border border-border p-4 text-sm">
                        <div className="flex items-start justify-between gap-3">
                            <p className="font-medium">{formatLocalDateTime(r.startTime, r.locationTimezone)}</p>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[r.status]}`}>
                                {r.status}
                            </span>
                        </div>
                        <dl className="mt-2 space-y-1 text-ink-muted">
                            <div className="flex gap-2">
                                <dt className="shrink-0 font-medium text-ink">Klijent:</dt>
                                <dd className="min-w-0">{r.clientName}</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="shrink-0 font-medium text-ink">Location:</dt>
                                <dd className="min-w-0">{r.locationName}</dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="shrink-0 font-medium text-ink">Services:</dt>
                                <dd className="min-w-0">{r.serviceNames.join(', ')}</dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ul>

            {/* Desktop: full table (scrolls horizontally on the off chance it's still too wide) */}
            <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
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
        </>
    );
}
