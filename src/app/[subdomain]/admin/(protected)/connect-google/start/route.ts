import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getAuthedAdmin } from "@/features/admin/lib/auth";
import {
  REQUIRED_SCOPES,
  buildOAuthClient,
} from "@/features/calendar/lib/google";
import { signOAuthState } from "@/features/calendar/lib/oauth-state";
import { buildSubdomainUrl } from "@/lib/url";

interface RouteContext {
  params: Promise<{ subdomain: string }>;
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext,
): Promise<NextResponse> {
  const { subdomain } = await ctx.params;

  const admin = await getAuthedAdmin();
  if (!admin) {
    return NextResponse.redirect(buildSubdomainUrl(subdomain, "/admin/login"));
  }

  const locationId = request.nextUrl.searchParams.get("locationId");
  if (!locationId) {
    return errorRedirect(subdomain, "locationId is required");
  }

  const service = getSupabaseServiceRoleClient();
  const { data: location } = await service
    .from("locations")
    .select("id, tenant_id")
    .eq("id", locationId)
    .maybeSingle();
  if (!location || location.tenant_id !== admin.tenantId) {
    return errorRedirect(subdomain, "Location not found");
  }

  let authUrl: string;
  try {
    const oauth2 = buildOAuthClient();
    const state = await signOAuthState(locationId);
    authUrl = oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: true,
      scope: REQUIRED_SCOPES,
      state,
    });
  } catch (err) {
    console.error("[connect-google/start] auth url build failed", err);
    return errorRedirect(subdomain, "Server misconfigured");
  }

  return NextResponse.redirect(authUrl);
}

function errorRedirect(subdomain: string, message: string): NextResponse {
  return NextResponse.redirect(
    buildSubdomainUrl(
      subdomain,
      `/admin/connect-google?google=error&message=${encodeURIComponent(message)}`,
    ),
  );
}
