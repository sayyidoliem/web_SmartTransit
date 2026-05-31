import { NextRequest, NextResponse } from "next/server";
import { getEtaStateForRoute } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  return NextResponse.json(getEtaStateForRoute(search.get("routeId") ?? "feeder-1a", {
    date: search.get("date") ?? undefined,
    day: search.get("day") ?? undefined,
    hour: search.get("hour") ?? undefined
  }));
}
