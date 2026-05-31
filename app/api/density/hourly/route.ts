import { NextRequest, NextResponse } from "next/server";
import { getHourlyDensityForDay } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const day = request.nextUrl.searchParams.get("day") ?? undefined;
  return NextResponse.json(getHourlyDensityForDay(day));
}
