import { NextRequest, NextResponse } from "next/server";
import { getEtaStateForRoute } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const routeId = request.nextUrl.searchParams.get("routeId") ?? "feeder-1a";
  return NextResponse.json(await getEtaStateForRoute(routeId));
}
