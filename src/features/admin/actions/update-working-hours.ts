'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { WorkingHours } from '@/lib/supabase/types';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface UpdateWorkingHoursState {
    ok: boolean | null;
    error?: string;
}

export async function updateWorkingHours(
    _prev: UpdateWorkingHoursState,
    formData: FormData,
): Promise<UpdateWorkingHoursState> {
    const locationId = String(formData.get('locationId') ?? '');
    if (!locationId) return { ok: false, error: 'Missing location' };

    const working_hours: WorkingHours = {};
    for (const day of WEEKDAYS) {
        const closed = formData.get(`${day}_closed`) === 'on';
        if (closed) {
            working_hours[day] = null;
            continue;
        }
        const open = String(formData.get(`${day}_open`) ?? '').trim();
        const close = String(formData.get(`${day}_close`) ?? '').trim();
        if (!HHMM_RE.test(open) || !HHMM_RE.test(close)) {
            return { ok: false, error: `Invalid time for ${day}` };
        }
        if (open >= close) {
            return { ok: false, error: `Open time must be before close time for ${day}` };
        }
        working_hours[day] = { open, close };
    }

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
        .from('locations')
        .update({ working_hours })
        .eq('id', locationId);

    if (error) return { ok: false, error: error.message };

    revalidatePath('/admin/working-hours');
    return { ok: true };
}
