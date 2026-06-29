import {
  getSupabaseServerClient,
  getSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

export interface AuthedAdmin {
  userId: string;
  tenantId: string;
}

// Resolves the signed-in admin's tenant_id from `profiles`.
//
// Auth is verified via the cookie-based client (the user's JWT). The profile
// lookup uses the service role to bypass RLS — the same approach as
// `/auth/callback`. This avoids the RLS-on-profiles flakiness that would
// otherwise let a valid session see `profile: null`.
//
// Server-only. Returns null if there is no session OR the profile row is
// missing.
export async function getAuthedAdmin(): Promise<AuthedAdmin | null> {
  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const service = getSupabaseServiceRoleClient();
  const { data: profile } = await service
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.tenant_id) return null;

  return { userId: user.id, tenantId: profile.tenant_id };
}
