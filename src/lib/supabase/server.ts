import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getAuthCookieDomain } from "@/lib/supabase/cookie-options";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            const domain = getAuthCookieDomain();
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(
                name,
                value,
                domain ? { ...options, domain } : options,
              );
            }
          } catch {
            // setAll fails inside Server Components; safe to ignore
            // because cookies are written by Server Actions / Route Handlers.
          }
        },
      },
    },
  );
}

export function getSupabaseServiceRoleClient() {
  // Bypasses RLS. Use only on the server, and only when a user JWT cannot do the job
  // (e.g. reading a reservation by cancellation token from a public link).
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
