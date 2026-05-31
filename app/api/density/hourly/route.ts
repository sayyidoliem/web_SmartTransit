import { NextRequest, NextResponse } from "next/server";
import { getHourlyDensityForDay } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  return NextResponse.json(getHourlyDensityForDay(search.get("day") ?? undefined, search.get("date") ?? undefined));
}
