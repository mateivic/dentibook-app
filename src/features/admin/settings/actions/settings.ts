"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getAuthedAdmin } from "@/features/admin/lib/auth";
import type { TenantConfig } from "@/lib/supabase/types";

export interface UpdateSettingsResult {
    ok: boolean;
    error?: string;
}

// Updates the tenant-wide "show prices" toggle stored in tenants.config JSONB.
// Reads the current config and merges so theming/font/language keys survive —
// never overwrite the whole blob with a single key.
export async function updateShowPrices(showPrices: boolean): Promise<UpdateSettingsResult> {
    const admin = await getAuthedAdmin();
    if (!admin) return { ok: false, error: "Unauthorized" };

    const supabase = getSupabaseServiceRoleClient();

    const { data: row, error: readErr } = await supabase
        .from("tenants")
        .select("config")
        .eq("id", admin.tenantId)
        .maybeSingle();
    if (readErr) return { ok: false, error: readErr.message };
    if (!row) return { ok: false, error: "Tenant not found" };

    const current = (row.config ?? {}) as TenantConfig;
    const nextConfig: TenantConfig = { ...current, showPrices };

    const { error: writeErr } = await supabase
        .from("tenants")
        .update({ config: nextConfig })
        .eq("id", admin.tenantId);
    if (writeErr) return { ok: false, error: writeErr.message };

    revalidatePath("/admin/settings");
    // The public booking layout reads config via ThemeProvider — refresh it so
    // the toggle takes effect on the wizard without a manual redeploy.
    revalidatePath("/", "layout");
    return { ok: true };
}
