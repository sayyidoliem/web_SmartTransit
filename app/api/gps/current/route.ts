import { NextRequest, NextResponse } from "next/server";
import { getRealtimeGpsSnapshot } from "@/lib/mock-data";
import type { CrowdingFilter, PriorityFilter } from "@/lib/types";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  return NextResponse.json(getRealtimeGpsSnapshot({
    date: search.get("date") ?? undefined,
    day: search.get("day") ?? undefined,
    hour: search.get("hour") ?? undefined,
    crowding: (search.get("crowding") as CrowdingFilter | null) ?? undefined,
    priority: (search.get("priority") as PriorityFilter | null) ?? undefined
  }));
}
