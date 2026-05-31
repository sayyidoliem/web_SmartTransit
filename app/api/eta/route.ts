import { NextRequest, NextResponse } from "next/server";
import { getEtaStateForRoute } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const routeId = search.get("routeId") ?? "feeder-1a";
  const day = search.get("day") ?? undefined;
  const hour = search.get("hour") ?? undefined;

  return NextResponse.json(getEtaStateForRoute(routeId, { day, hour }));
}
