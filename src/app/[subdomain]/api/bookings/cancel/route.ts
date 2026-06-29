import { NextResponse, type NextRequest } from "next/server";
import { cancelBookingByToken } from "@/features/booking/server/cancel-booking";

interface RouteContext {
  params: Promise<{ subdomain: string }>;
}

export async function POST(request: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { subdomain } = await ctx.params;

  let token: string | null = null;
  try {
    const body = (await request.json()) as { token?: string };
    token = body.token ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const result = await cancelBookingByToken(subdomain, token);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, alreadyCancelled: result.alreadyCancelled });
}
