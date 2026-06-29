import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthCookieDomain } from "@/lib/supabase/cookie-options";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "lvh.me";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Decide on the outgoing response shape (rewrite into the [subdomain]
  // segment, or pass-through) *before* the Supabase refresh runs, so the
  // refresh writes its Set-Cookie headers onto whichever response we end
  // up returning. Reassigning `response` later would lose the rewrite.
  const host = request.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0];
  const subdomain = extractSubdomain(hostWithoutPort, BASE_DOMAIN);

  let response: NextResponse;
  if (subdomain) {
    const url = request.nextUrl.clone();
    const alreadyInSegment =
      url.pathname.startsWith(`/${subdomain}/`) ||
      url.pathname === `/${subdomain}`;
    if (alreadyInSegment) {
      response = NextResponse.next();
    } else {
      url.pathname = `/${subdomain}${url.pathname}`;
      response = NextResponse.rewrite(url);
    }
  } else {
    response = NextResponse.next();
  }

  // Supabase SSR session refresh. Wrapped so any failure (network blip,
  // misconfigured env, etc.) can't suppress the rewrite above — without
  // the rewrite, `acme.lvh.me/admin` would route to `[subdomain]=admin`
  // and the global not-found page would render.
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            const domain = getAuthCookieDomain();
            for (const { name, value, options } of cookiesToSet) {
              request.cookies.set(name, value);
              response.cookies.set(
                name,
                value,
                domain ? { ...options, domain } : options,
              );
            }
          },
        },
      },
    );
    await supabase.auth.getUser();
  } catch (err) {
    console.error("[proxy] Supabase session refresh failed:", err);
  }

  return response;
}

function extractSubdomain(host: string, baseDomain: string): string | null {
  if (!host.endsWith(baseDomain)) return null;
  if (host === baseDomain) return null;

  const sub = host.slice(0, -baseDomain.length - 1);
  if (!sub || sub === "www") return null;
  return sub;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
