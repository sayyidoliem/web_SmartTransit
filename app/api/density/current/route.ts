import { NextRequest, NextResponse } from "next/server";
import { getCurrentDensity } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  return NextResponse.json(getCurrentDensity({
    day: search.get("day") ?? undefined,
    hour: search.get("hour") ?? undefined
  }));
}
