import { NextResponse, type NextRequest } from "next/server";
import {
  processBooking,
  type ProcessBookingInput,
} from "@/features/booking/server/process-booking";

interface RouteContext {
  params: Promise<{ subdomain: string }>;
}

export async function POST(request: NextRequest, ctx: RouteContext): Promise<NextResponse> {
  const { subdomain } = await ctx.params;

  let body: ProcessBookingInput;
  try {
    body = (await request.json()) as ProcessBookingInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await processBooking(subdomain, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    reservationId: result.reservationId,
    cancellationToken: result.cancellationToken,
    status: result.status,
  });
}
