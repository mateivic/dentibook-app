import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getAuthedAdmin } from "@/features/admin/lib/auth";
import { buildOAuthClient } from "@/features/calendar/lib/google";
import { buildSubdomainUrl } from "@/lib/url";

interface RouteContext {
  params: Promise<{ subdomain: string }>;
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext,
): Promise<NextResponse> {
  const { subdomain } = await ctx.params;

  const admin = await getAuthedAdmin();
  if (!admin) {
    return NextResponse.redirect(buildSubdomainUrl(subdomain, "/admin/login"));
  }

  const formData = await request.formData();
  const locationId = String(formData.get("locationId") ?? "");
  if (!locationId) {
    return errorRedirect(subdomain, "locationId is required");
  }

  const service = getSupabaseServiceRoleClient();
  const { data: integration } = await service
    .from("calendar_integrations")
    .select("id, tenant_id, refresh_token")
    .eq("location_id", locationId)
    .maybeSingle();

  if (!integration || integration.tenant_id !== admin.tenantId) {
    return errorRedirect(subdomain, "Integration not found");
  }

  // Best-effort revoke at Google; never block the disconnect on a revoke failure.
  try {
    const oauth2 = buildOAuthClient();
    await oauth2.revokeToken(integration.refresh_token);
  } catch (err) {
    console.warn("[connect-google/disconnect] revoke failed (continuing)", err);
  }

  const { error } = await service
    .from("calendar_integrations")
    .delete()
    .eq("id", integration.id);
  if (error) {
    console.error("[connect-google/disconnect] delete failed", error);
    return errorRedirect(subdomain, "Could not disconnect");
  }

  return NextResponse.redirect(
    buildSubdomainUrl(subdomain, "/admin/connect-google?google=disconnected"),
  );
}

function errorRedirect(subdomain: string, message: string): NextResponse {
  return NextResponse.redirect(
    buildSubdomainUrl(
      subdomain,
      `/admin/connect-google?google=error&message=${encodeURIComponent(message)}`,
    ),
  );
}
