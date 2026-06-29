'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { cancelBookingByToken } from '../server/cancel-booking';

export interface ReservationPreview {
    locationName: string;
    timezone: string;
    startTime: string;
    serviceNames: string[];
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export async function getReservationByToken(token: string): Promise<ReservationPreview | null> {
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
        .from('reservations')
        .select(`
            start_time,
            status,
            locations!inner(name, timezone),
            reservation_services!inner(services!inner(name))
        `)
        .eq('cancellation_token', token)
        .maybeSingle();

    if (error || !data) return null;

    const location = data.locations as unknown as { name: string; timezone: string };
    const rs = data.reservation_services as unknown as Array<{ services: { name: string } }>;

    return {
        locationName: location.name,
        timezone: location.timezone,
        startTime: data.start_time as string,
        serviceNames: rs.map((r) => r.services.name),
        status: data.status as ReservationPreview['status'],
    };
}

export async function confirmCancellation(formData: FormData): Promise<void> {
    const token = String(formData.get('token') ?? '');
    const subdomain = String(formData.get('subdomain') ?? '');
    if (!token || !subdomain) return;

    await cancelBookingByToken(subdomain, token);
    redirect(`/cancel/${token}/done`);
}
